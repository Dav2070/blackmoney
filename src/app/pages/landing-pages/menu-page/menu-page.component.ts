import { Component, ViewChild } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import {
	faCopy,
	faPercent,
	faReceipt,
	faUtensils
} from "@fortawesome/pro-regular-svg-icons"
import { EditRestaurantNameDialogComponent } from "src/app/dialogs/edit-restaurant-name-dialog/edit-restaurant-name-dialog.component"
import { EditAddressDialogComponent } from "src/app/dialogs/edit-address-dialog/edit-address-dialog.component"
import { LocalizationService } from "src/app/services/localization-service"
import * as ErrorCodes from "src/app/errorCodes"

@Component({
	selector: "app-menu-page",
	templateUrl: "./menu-page.component.html",
	styleUrl: "./menu-page.component.scss",
	standalone: false
})
export class MenuPageComponent {
	locale = this.localizationService.locale.menuPage
	errorsLocale = this.localizationService.locale.errors
	faCopy = faCopy
	faPercent = faPercent
	faReceipt = faReceipt
	faUtensils = faUtensils
	uuid: string = null

	constructor(
		private apiService: ApiService,
		private dataService: DataService,
		private localizationService: LocalizationService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		this.uuid = this.activatedRoute.snapshot.paramMap.get("uuid")

		await this.dataService.davUserPromiseHolder.AwaitResult()
	}

	navigateBack() {
		this.router.navigate(["user", "restaurants", this.uuid])
	}

	navigateToProductsPage(event: MouseEvent) {
		event.preventDefault()

		this.router.navigate([
			"user",
			"restaurants",
			this.uuid,
			"menu",
			"products"
		])
	}

	navigateToOffersPage(event: MouseEvent) {
		event.preventDefault()

		this.router.navigate(["user", "restaurants", this.uuid, "menu", "offers"])
	}

	navigateToMenusPage(event: MouseEvent) {
		event.preventDefault()

		this.router.navigate(["user", "restaurants", this.uuid, "menu", "menus"])
	}

	openCopyDialog(event: MouseEvent) {}
}
