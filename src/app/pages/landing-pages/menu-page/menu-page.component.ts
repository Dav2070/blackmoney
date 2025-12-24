import { Component } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { faTags, faSplit } from "@fortawesome/pro-regular-svg-icons"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-menu-page",
	standalone: false,
	templateUrl: "./menu-page.component.html",
	styleUrl: "./menu-page.component.scss"
})
export class MenuPageComponent {
	locale = this.localizationService.locale.productPage
	errorsLocale = this.localizationService.locale.errors
	faTags = faTags
	faSplit = faSplit
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
		this.router.navigate(["user", "restaurants", this.uuid])
	}

	navigateToCategoryPage(event: MouseEvent) {
		event.preventDefault()

		this.router.navigate([
			"user",
			"restaurants",
			this.uuid,
			"menu",
			"category"
		])
	}

	navigateToVariationsPage(event: MouseEvent) {
		event.preventDefault()

		this.router.navigate([
			"user",
			"restaurants",
			this.uuid,
			"menu",
			"variations"
		])
	}
}