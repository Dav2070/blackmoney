import { Component, OnInit } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { Category } from "src/app/models/Category"
import { Product } from "src/app/models/Product"
import { Variation } from "src/app/models/Variation"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-products-overview-page",
	standalone: false,
	templateUrl: "./products-overview-page.component.html",
	styleUrl: "./products-overview-page.component.scss"
})
export class ProductsOverviewPageComponent implements OnInit {
	locale = this.localizationService.locale.productPage
	errorsLocale = this.localizationService.locale.errors
	uuid: string = null
	activeTab = "food"
	category: Category = null

	constructor(
		private readonly dataService: DataService,
		private readonly localizationService: LocalizationService,
		private readonly router: Router,
		private readonly activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		this.uuid = this.activatedRoute.snapshot.paramMap.get("uuid")
		await this.dataService.davUserPromiseHolder.AwaitResult()

		// Lade Sample-Kategorie mit Produkten
		this.category = this.buildSampleCategory()

		// Initialer Tab aus URL oder default
		const currentChild =
			this.activatedRoute.firstChild?.snapshot.routeConfig?.path
		if (currentChild) {
			this.activeTab = currentChild
		} else {
			this.selectTab("food")
		}
	}

	private buildSampleCategory(): Category {
		const category: Category = {
			uuid: "1",
			name: "Pizza",
			products: []
		}

		const sizeVariation: Variation = {
			uuid: "size-var",
			name: "Größe",
			variationItems: [
				{ id: 1, uuid: "size-s", name: "Klein", additionalCost: 0 },
				{ id: 2, uuid: "size-m", name: "Mittel", additionalCost: 150 },
				{ id: 3, uuid: "size-l", name: "Groß", additionalCost: 300 }
			]
		}

		category.products = [
			{
				id: 1001,
				uuid: "prod-1",
				name: "Pizza Margherita",
				price: 850,
				type: "FOOD",
				category,
				variations: [sizeVariation],
				takeaway: true
			},
			{
				id: 1002,
				uuid: "prod-2",
				name: "Pizza Salami",
				price: 950,
				type: "FOOD",
				category,
				variations: [sizeVariation],
				takeaway: true
			},
			{
				id: 1003,
				uuid: "prod-3",
				name: "Pizza Funghi",
				price: 920,
				type: "FOOD",
				category,
				variations: [sizeVariation],
				takeaway: false
			}
		]

		return category
	}

	selectTab(tab: string) {
		this.activeTab = tab
		// navigate to child route (relativeTo this component's route)
		this.router.navigate([tab], { relativeTo: this.activatedRoute })
	}

	navigateBack() {
		this.router.navigate([
			"user",
			"restaurants",
			this.uuid,
			"menu",
			"category"
		])
	}

	deleteProduct(product: Product) {
		// Lösche das Produkt oder öffne Bestätigungsdialog
		console.log("Delete product:", product)
		// z.B.: this.selectedCategoryObj.products = this.selectedCategoryObj.products.filter(p => p.uuid !== product.uuid)
	}
}
