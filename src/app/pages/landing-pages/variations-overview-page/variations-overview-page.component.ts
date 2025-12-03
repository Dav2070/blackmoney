import {
	Component,
	OnInit,
	ViewChild,
	ElementRef,
	HostListener
} from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { faPen, faTrash, faEllipsis } from "@fortawesome/free-solid-svg-icons"
import { Variation } from "src/app/models/Variation"
import { VariationItem } from "src/app/models/VariationItem"
import { LocalizationService } from "src/app/services/localization-service"
import { AddVariationDialogComponent } from "src/app/dialogs/add-variation-dialog/add-variation-dialog.component"
import { ContextMenu } from "dav-ui-components"

@Component({
	selector: "app-variations-overview-page",
	templateUrl: "./variations-overview-page.component.html",
	styleUrls: ["./variations-overview-page.component.scss"],
	standalone: false
})
export class VariationsOverviewPageComponent implements OnInit {
editSelectedVariation() {
throw new Error('Method not implemented.')
}
editSelectedVariationItem() {
throw new Error('Method not implemented.')
}
	locale = this.localizationService.locale.variationsPage
	actionsLocale = this.localizationService.locale.actions
	faPen = faPen
	faTrash = faTrash
	faEllipsis = faEllipsis

	uuid: string = null
	selectedVariation: Variation = null

	variations: Variation[] = [
		{
			uuid: "1",
			name: "Größe",
			variationItems: [
				{ id: 1, uuid: "1-1", name: "Klein", additionalCost: 0 },
				{ id: 2, uuid: "1-2", name: "Mittel", additionalCost: 2 },
				{ id: 3, uuid: "1-3", name: "Groß", additionalCost: 4 }
			]
		},
		{
			uuid: "2",
			name: "Extras",
			variationItems: [
				{ id: 4, uuid: "2-1", name: "Extra Käse", additionalCost: 1.5 },
				{ id: 5, uuid: "2-2", name: "Bacon", additionalCost: 2 }
			]
		}
	]

	@ViewChild("addVariationDialog")
	addVariationDialog: AddVariationDialogComponent

	@ViewChild("addVariationItemDialog")
	addVariationItemDialog: any

	@ViewChild("variationContextMenu")
	variationContextMenu!: ElementRef<ContextMenu>
	@ViewChild("variationItemContextMenu")
	variationItemContextMenu!: ElementRef<ContextMenu>

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
		private router: Router,
		private localizationService: LocalizationService,
		private readonly activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		this.uuid = this.activatedRoute.snapshot.paramMap.get("uuid")
	}

	navigateBack() {
		this.router.navigate(["user", "restaurants", this.uuid, "menu"])
	}

	showAddVariationDialog() {
		this.addVariationDialog.show()
	}

	addVariationDialogPrimaryButtonClick(event: {
		name: string
		variationItems: VariationItem[]
	}) {
		const newVariation: Variation = {
			uuid: crypto.randomUUID(),
			name: event.name,
			variationItems: event.variationItems
		}

		this.variations.push(newVariation)
		console.log("Added Variation:", newVariation)
		this.addVariationDialog.hide()
	}

	editVariation(variation: Variation) {
		console.log("Edit Variation", variation)
	}

	deleteVariation(variation: Variation) {
		this.variations = this.variations.filter(v => v.uuid !== variation.uuid)
	}

	deleteVariationItem(variation: Variation, item: VariationItem) {
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

		const newItem: VariationItem = {
			id: Date.now(),
			uuid: crypto.randomUUID(),
			name: event.name,
			additionalCost: event.additionalCost
		}

		// Item zur ausgewählten Variation hinzufügen
		if (!this.selectedVariation.variationItems) {
			this.selectedVariation.variationItems = []
		}
		this.selectedVariation.variationItems.push(newItem)

		console.log("Added Item to", this.selectedVariation, newItem)
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
