import { Component } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { faPen } from "@fortawesome/pro-regular-svg-icons"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-product-page",
	templateUrl: "./product-page.component.html",
	styleUrl: "./product-page.component.scss",
	standalone: false
})
export class ProductPageComponent {
	locale = this.localizationService.locale.productPage
	errorsLocale = this.localizationService.locale.errors
	faPen = faPen
	uuid: string = null

	constructor(
		private readonly dataService: DataService,
		private readonly localizationService: LocalizationService,
		private readonly router: Router,
		private readonly activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		this.uuid = this.activatedRoute.snapshot.paramMap.get("uuid")

		await this.dataService.davUserPromiseHolder.AwaitResult()
	}

	navigateBack() {
		this.router.navigate(["user", "restaurants", this.uuid, "menu"])
	}

	navigateToProductsPage(event: MouseEvent) {
		event.preventDefault()

		this.router.navigate([
			"user",
			"restaurants",
			this.uuid,
			"menu",
			"product",
			"products"
		])
	}

	navigateToVariationsPage(event: MouseEvent) {
		event.preventDefault()

		this.router.navigate([
			"user",
			"restaurants",
			this.uuid,
			"menu",
			"product",
			"variations"
		])
	}

	navigateToOptionsPage(event: MouseEvent) {
		event.preventDefault()

		this.router.navigate([
			"user",
			"restaurants",
			this.uuid,
			"menu",
			"product",
			"options"
		])
	}

}
