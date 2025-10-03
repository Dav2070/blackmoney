import { Component } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { faPen } from "@fortawesome/pro-regular-svg-icons"
import { systemThemeKey } from "src/app/constants"
import { Category } from "src/app/models/Category"
import { Variation } from "src/app/models/Variation"
import { VariationItem } from "src/app/models/VariationItem"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-products-overview-page",
	standalone: false,
	templateUrl: "./products-overview-page.component.html",
	styleUrl: "./products-overview-page.component.scss"
})
export class ProductsOverviewPageComponent {
	deleteCategory(_t7: Category) {
		throw new Error("Method not implemented.")
	}
	editCategory(_t7: Category) {
		throw new Error("Method not implemented.")
	}
	locale = this.localizationService.locale.productPage
	errorsLocale = this.localizationService.locale.errors
	faPen = faPen
	uuid: string = null

	// Beispiel-VariationItems
	großItem: VariationItem = {
		id: 1,
		uuid: "vi-1",
		name: "Groß",
		additionalCost: 2
	}
	kleinItem: VariationItem = {
		id: 2,
		uuid: "vi-2",
		name: "Klein",
		additionalCost: 0
	}
	extraKäseItem: VariationItem = {
		id: 3,
		uuid: "vi-3",
		name: "Extra Käse",
		additionalCost: 1
	}
	mitEisItem: VariationItem = {
		id: 4,
		uuid: "vi-4",
		name: "Mit Eis",
		additionalCost: 0
	}

	// Beispiel-Variationen
	sizeVariation: Variation = {
		uuid: "v-1",
		name: "Größe",
		variationItems: [this.kleinItem, this.großItem]
	}
	toppingVariation: Variation = {
		uuid: "v-2",
		name: "Topping",
		variationItems: [this.extraKäseItem]
	}
	iceVariation: Variation = {
		uuid: "v-3",
		name: "Eis",
		variationItems: [this.mitEisItem]
	}
	categories: Category[] = [
		{
			uuid: "1",
			name: "Vorspeise",
			type: "FOOD",
			products: [
				{
					id: 10,
					uuid: "prod-10",
					name: "Vorspeisenteller",
					price: 10.5,
					variations: [],
					takeaway: false
				}
			]
		},
		{
			uuid: "2",
			name: "Hauptspeise",
			type: "FOOD",
			products: [
				{
					id: 1,
					uuid: "prod-1",
					name: "Margherita",
					price: 7.5,
					variations: [this.sizeVariation, this.toppingVariation],
					takeaway: true
				},
				{
					id: 3,
					uuid: "prod-3",
					name: "Salami",
					price: 8.5,
					variations: [this.sizeVariation, this.toppingVariation],
					takeaway: true
				}
			]
		},
		{
			uuid: "3",
			name: "Bier",
			type: "DRINK",
			products: []
		},
		{
			uuid: "4",
			name: "Softdrinks",
			type: "DRINK",
			products: [
				{
					id: 2,
					uuid: "prod-2",
					name: "Cola",
					price: 2.5,
					variations: [this.iceVariation],
					takeaway: false
				}
			]
		}
	]
	selectedCategory: String = null

	constructor(
		private readonly dataService: DataService,
		private readonly localizationService: LocalizationService,
		private readonly router: Router,
		private readonly activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		this.uuid = this.activatedRoute.snapshot.paramMap.get("uuid")
		this.selectedCategory =
			this.activatedRoute.snapshot.paramMap.get("categoryuuid")

		await this.dataService.davUserPromiseHolder.AwaitResult()
	}

	navigateBack() {
		this.router.navigate([
			"user",
			"restaurants",
			this.uuid,
			"menu",
			"product",
			"category"
		])
	}

	selectCategory(category: Category) {
		this.router.navigate([
			"user",
			"restaurants",
			this.uuid,
			"menu",
			"product",
			"category",
			category.uuid
		])
		this.selectedCategory = category.uuid
	}
}
