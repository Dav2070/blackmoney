import { Component } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { Product } from "src/app/models/Product"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-products-overview-page",
	standalone: false,
	templateUrl: "./products-overview-page.component.html",
	styleUrl: "./products-overview-page.component.scss"
})
export class ProductsOverviewPageComponent {
	locale = this.localizationService.locale.productPage
	errorsLocale = this.localizationService.locale.errors
	uuid: string = null
	activeTab = "food" // default

	constructor(
		private readonly dataService: DataService,
		private readonly localizationService: LocalizationService,
		private readonly router: Router,
		private readonly activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		this.uuid = this.activatedRoute.snapshot.paramMap.get("uuid")
		await this.dataService.davUserPromiseHolder.AwaitResult()

		// Initialer Tab aus URL oder default
		const currentChild =
			this.activatedRoute.firstChild?.snapshot.routeConfig?.path
		if (currentChild) {
			this.activeTab = currentChild
		} else {
			// Navigiere zum default tab wenn keine Child-Route aktiv
			this.selectTab("food")
		}
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
