import { Component, ViewChild } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { faLocationDot, faPen } from "@fortawesome/pro-regular-svg-icons"
import { EditAddressDialogComponent } from "src/app/dialogs/edit-address-dialog/edit-address-dialog.component"

@Component({
	templateUrl: "./restaurant-page.component.html",
	styleUrl: "./restaurant-page.component.scss",
	standalone: false
})
export class RestaurantPageComponent {
	faLocationDot = faLocationDot
	faPen = faPen
	name: string = ""
	city: string = ""
	country: string = ""
	line1: string = ""
	line2: string = ""
	postalCode: string = ""

	//#region EditAddressDialog
	@ViewChild("editAddressDialog")
	editAddressDialog: EditAddressDialogComponent
	editAddressDialogLoading: boolean = false
	//#endregion

	constructor(
		private apiService: ApiService,
		private dataService: DataService,
		private activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		const uuid = this.activatedRoute.snapshot.paramMap.get("uuid")

		await this.dataService.davUserPromiseHolder.AwaitResult()

		const retrieveRestaurantResponse =
			await this.apiService.retrieveRestaurant(
				`
					name
					city
					country
					line1
					line2
					postalCode
				`,
				{ uuid }
			)

		if (retrieveRestaurantResponse.data == null) return

		this.name = retrieveRestaurantResponse.data.retrieveRestaurant.name
		this.city = retrieveRestaurantResponse.data.retrieveRestaurant.city
		this.country = retrieveRestaurantResponse.data.retrieveRestaurant.country
		this.line1 = retrieveRestaurantResponse.data.retrieveRestaurant.line1
		this.line2 = retrieveRestaurantResponse.data.retrieveRestaurant.line2
		this.postalCode =
			retrieveRestaurantResponse.data.retrieveRestaurant.postalCode
	}

	showEditAddressDialog() {
		this.editAddressDialogLoading = false
		this.editAddressDialog.show()
	}
}
