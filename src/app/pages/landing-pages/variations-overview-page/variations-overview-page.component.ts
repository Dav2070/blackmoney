import { Component, OnInit } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons"
import { Variation } from "src/app/models/Variation"
import { VariationItem } from "src/app/models/VariationItem"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-variations-overview-page",
	standalone: false,
	templateUrl: "./variations-overview-page.component.html",
	styleUrl: "./variations-overview-page.component.scss"
})
export class VariationsOverviewPageComponent implements OnInit {
	locale = this.localizationService.locale.variationsPage
	faPen = faPen
	faTrash = faTrash

  uuid: string = null

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

	constructor(
		private router: Router,
		private localizationService: LocalizationService,
    private readonly activatedRoute: ActivatedRoute
	) {}

  async ngOnInit() {
		this.uuid = this.activatedRoute.snapshot.paramMap.get("uuid")
	}

	navigateBack() {
		this.router.navigate([
			"user",
			"restaurants",
			this.uuid,
			"menu",
			"product"
		])
	}

	showAddVariationDialog() {
		console.log("Add Variation")
	}

	editVariation(variation: Variation) {
		console.log("Edit Variation", variation)
	}

	deleteVariation(variation: Variation) {
		console.log("Delete Variation", variation)
	}

	showAddVariationItemDialog(variation: Variation) {
		console.log("Add VariationItem to", variation)
	}

	editVariationItem(variation: Variation, item: VariationItem) {
		console.log("Edit VariationItem", item, "in", variation)
	}

	deleteVariationItem(variation: Variation, item: VariationItem) {
		console.log("Delete VariationItem", item, "from", variation)
	}
}
