import { Component, OnInit, ViewChild } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons"
import { Variation } from "src/app/models/Variation"
import { VariationItem } from "src/app/models/VariationItem"
import { LocalizationService } from "src/app/services/localization-service"
import { AddVariationDialogComponent } from "src/app/dialogs/add-variation-dialog/add-variation-dialog.component"

@Component({
	selector: "app-variations-overview-page",
	templateUrl: "./variations-overview-page.component.html",
	styleUrls: ["./variations-overview-page.component.scss"],
	standalone: false
})
export class VariationsOverviewPageComponent implements OnInit {
	locale = this.localizationService.locale.variationsPage
	faPen = faPen
	faTrash = faTrash

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
		console.log("Delete Variation", variation)
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

	deleteVariationItem(variation: Variation, item: VariationItem) {
		console.log("Delete VariationItem", item, "from", variation)
	}
}
