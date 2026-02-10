import { Component, ViewChild, ElementRef, HostListener } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { faPen, faTrash } from "@fortawesome/pro-regular-svg-icons"
import { ContextMenu } from "dav-ui-components"
import { Variation } from "src/app/models/Variation"
import { VariationItem } from "src/app/models/VariationItem"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { ApiService } from "src/app/services/api-service"
import { AddVariationDialogComponent } from "src/app/dialogs/add-variation-dialog/add-variation-dialog.component"
import { AddVariationItemDialogComponent } from "src/app/dialogs/add-variation-item-dialog/add-variation-item-dialog.component"
import { EditVariationDialogComponent } from "src/app/dialogs/edit-variation-dialog/edit-variation-dialog.component"
import { EditVariationItemDialogComponent } from "src/app/dialogs/edit-variation-item-dialog/edit-variation-item-dialog.component"
import { convertRestaurantResourceToRestaurant } from "src/app/utils"

@Component({
	templateUrl: "./variations-page.component.html",
	styleUrls: ["./variations-page.component.scss"],
	standalone: false
})
export class VariationsPageComponent {
	locale = this.localizationService.locale.variationsPage
	actionsLocale = this.localizationService.locale.actions
	faPen = faPen
	faTrash = faTrash

	uuid: string = null
	selectedVariation: Variation = null
	variations: Variation[] = []
	loading: boolean = true

	@ViewChild("addVariationDialog")
	addVariationDialog: AddVariationDialogComponent
	addVariationDialogLoading: boolean = false

	@ViewChild("addVariationItemDialog")
	addVariationItemDialog: AddVariationItemDialogComponent
	addVariationItemDialogLoading: boolean = false

	@ViewChild("variationContextMenu")
	variationContextMenu!: ElementRef<ContextMenu>
	@ViewChild("variationItemContextMenu")
	variationItemContextMenu!: ElementRef<ContextMenu>

	@ViewChild("editVariationDialog")
	editVariationDialog: EditVariationDialogComponent
	editVariationDialogLoading: boolean = false

	@ViewChild("editVariationItemDialog")
	editVariationItemDialog: EditVariationItemDialogComponent
	editVariationItemDialogLoading: boolean = false

	variationContextMenuVisible = false
	variationContextMenuX = 0
	variationContextMenuY = 0
	selectedVariationForContext: Variation = null

	variationItemContextMenuVisible = false
	variationItemContextMenuX = 0
	variationItemContextMenuY = 0
	selectedVariationItemForContext: VariationItem = null
	selectedVariationForItemContext: Variation = null

	constructor(
		private readonly dataService: DataService,
		private readonly localizationService: LocalizationService,
		private readonly apiService: ApiService,
		private readonly router: Router,
		private readonly activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		await this.dataService.blackmoneyUserPromiseHolder.AwaitResult()
		this.uuid = this.activatedRoute.snapshot.paramMap.get("uuid")

		// Load data
		await this.loadData()
	}

	async loadData() {
		const retrieveRestaurantResponse =
			await this.apiService.retrieveRestaurant(
				`
					menu {
						variations {
							items {
								uuid
								name
								variationItems {
									items {
										uuid
										name
										additionalCost
									}
								}
							}
						}
					}
				`,
				{ uuid: this.uuid }
			)

		if (retrieveRestaurantResponse.data != null) {
			const restaurant = convertRestaurantResourceToRestaurant(
				retrieveRestaurantResponse.data.retrieveRestaurant
			)
			this.variations = restaurant.menu.variations
		}

		this.loading = false
	}

	navigateBack() {
		this.router.navigate(["dashboard", "restaurants", this.uuid, "menu"])
	}

	showAddVariationDialog() {
		this.addVariationDialog.show()
	}

	addVariationDialogPrimaryButtonClick(event: {
		name: string
		variationItems: VariationItem[]
	}) {
		this.addVariationDialogLoading = true

		// TODO: API - Create variation
		// Example: const created = await this.apiService.createVariation({
		//   restaurantUuid: this.uuid,
		//   name: event.name,
		//   variationItems: event.variationItems
		// })

		const newVariation: Variation = {
			uuid: crypto.randomUUID(),
			name: event.name,
			variationItems: event.variationItems
		}

		this.variations = [...this.variations, newVariation]

		this.addVariationDialogLoading = false
		this.addVariationDialog.hide()
	}

	deleteVariation(variation: Variation) {
		const confirmed = confirm(
			`Variation "${variation.name}" wirklich löschen?`
		)
		if (!confirmed) return

		// TODO: API - Delete variation
		// Example: await this.apiService.deleteVariation({ uuid: variation.uuid })

		this.variations = this.variations.filter(v => v.uuid !== variation.uuid)
	}

	deleteVariationItem(variation: Variation, item: VariationItem) {
		const confirmed = confirm(`Item "${item.name}" wirklich löschen?`)
		if (!confirmed) return

		// TODO: API - Delete variation item
		// Example: await this.apiService.deleteVariationItem({ uuid: item.uuid })

		const idx = this.variations.findIndex(v => v.uuid === variation.uuid)
		if (idx === -1) return

		const items = this.variations[idx].variationItems ?? []
		this.variations[idx].variationItems = items.filter(
			i => i.uuid !== item.uuid
		)
	}

	showAddVariationItemDialog(variation: Variation) {
		this.selectedVariation = variation
		this.addVariationItemDialog.show()
	}

	addVariationItemDialogPrimaryButtonClick(event: {
		name: string
		additionalCost: number
	}) {
		if (!this.selectedVariation) return

		this.addVariationItemDialogLoading = true

		// TODO: API - Create variation item
		// Example: const created = await this.apiService.createVariationItem({
		//   variationUuid: this.selectedVariation.uuid,
		//   name: event.name,
		//   additionalCost: event.additionalCost
		// })

		const newItem: VariationItem = {
			id: Date.now(),
			uuid: crypto.randomUUID(),
			name: event.name,
			additionalCost: event.additionalCost
		}

		if (!this.selectedVariation.variationItems) {
			this.selectedVariation.variationItems = []
		}
		this.selectedVariation.variationItems = [
			...this.selectedVariation.variationItems,
			newItem
		]

		this.addVariationItemDialogLoading = false
		this.addVariationItemDialog.hide()
		this.selectedVariation = null
	}

	showVariationContextMenu(event: Event, variation: Variation) {
		const detail = (event as CustomEvent).detail
		this.selectedVariationForContext = variation

		if (this.variationContextMenuVisible) {
			this.variationContextMenuVisible = false
		} else {
			this.variationContextMenuX = detail.contextMenuPosition.x
			this.variationContextMenuY = detail.contextMenuPosition.y
			this.variationContextMenuVisible = true
		}
	}

	showVariationItemContextMenu(
		event: Event,
		variation: Variation,
		item: VariationItem
	) {
		const detail = (event as CustomEvent).detail
		this.selectedVariationForItemContext = variation
		this.selectedVariationItemForContext = item

		if (this.variationItemContextMenuVisible) {
			this.variationItemContextMenuVisible = false
		} else {
			this.variationItemContextMenuX = detail.contextMenuPosition.x
			this.variationItemContextMenuY = detail.contextMenuPosition.y
			this.variationItemContextMenuVisible = true
		}
	}

	// actions invoked from context menu
	deleteSelectedVariation() {
		if (!this.selectedVariationForContext) return
		this.deleteVariation(this.selectedVariationForContext)
		this.selectedVariationForContext = null
		this.variationContextMenuVisible = false
	}

	deleteSelectedVariationItem() {
		if (
			!this.selectedVariationForItemContext ||
			!this.selectedVariationItemForContext
		)
			return
		this.deleteVariationItem(
			this.selectedVariationForItemContext,
			this.selectedVariationItemForContext
		)
		this.selectedVariationForItemContext = null
		this.selectedVariationItemForContext = null
		this.variationItemContextMenuVisible = false
	}

	editSelectedVariation() {
		if (!this.selectedVariationForContext) return
		this.editVariationDialog.show(this.selectedVariationForContext)
		this.variationContextMenuVisible = false
	}

	editSelectedVariationItem() {
		if (
			!this.selectedVariationForItemContext ||
			!this.selectedVariationItemForContext
		)
			return
		this.editVariationItemDialog.show(this.selectedVariationItemForContext)
		this.variationItemContextMenuVisible = false
	}

	editVariationDialogPrimaryButtonClick(event: {
		uuid: string
		name: string
		variationItems: VariationItem[]
	}) {
		this.editVariationDialogLoading = true

		// TODO: API - Update variation
		// Example: const updated = await this.apiService.updateVariation({
		//   uuid: event.uuid,
		//   name: event.name,
		//   variationItems: event.variationItems
		// })

		const idx = this.variations.findIndex(v => v.uuid === event.uuid)
		if (idx !== -1) {
			this.variations = [
				...this.variations.slice(0, idx),
				{
					...this.variations[idx],
					name: event.name,
					variationItems: event.variationItems
				},
				...this.variations.slice(idx + 1)
			]
		}

		this.editVariationDialogLoading = false
		this.editVariationDialog.hide()
	}

	editVariationItemDialogPrimaryButtonClick(event: {
		uuid: string
		name: string
		additionalCost: number
	}) {
		if (!this.selectedVariationForItemContext) return

		this.editVariationItemDialogLoading = true

		// TODO: API - Update variation item
		// Example: const updated = await this.apiService.updateVariationItem({
		//   uuid: event.uuid,
		//   name: event.name,
		//   additionalCost: event.additionalCost
		// })

		const itemIdx =
			this.selectedVariationForItemContext.variationItems.findIndex(
				i => i.uuid === event.uuid
			)
		if (itemIdx !== -1) {
			this.selectedVariationForItemContext.variationItems = [
				...this.selectedVariationForItemContext.variationItems.slice(
					0,
					itemIdx
				),
				{
					...this.selectedVariationForItemContext.variationItems[itemIdx],
					name: event.name,
					additionalCost: event.additionalCost
				},
				...this.selectedVariationForItemContext.variationItems.slice(
					itemIdx + 1
				)
			]
		}

		this.editVariationItemDialogLoading = false
		this.editVariationItemDialog.hide()
		this.selectedVariationForItemContext = null
	}

	@HostListener("document:click", ["$event"])
	documentClick(event: MouseEvent) {
		// Variation-Menü schließen, wenn außerhalb geklickt wird
		if (
			this.variationContextMenuVisible &&
			!this.variationContextMenu.nativeElement.contains(event.target as Node)
		) {
			this.variationContextMenuVisible = false
		}

		// Variation-Item-Menü schließen, wenn außerhalb geklickt wird
		if (
			this.variationItemContextMenuVisible &&
			!this.variationItemContextMenu.nativeElement.contains(
				event.target as Node
			)
		) {
			this.variationItemContextMenuVisible = false
		}
	}
}
