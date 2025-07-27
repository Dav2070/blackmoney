import { Component, ViewChild } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { faLocationDot, faPen } from "@fortawesome/pro-regular-svg-icons"
import { EditRestaurantNameDialogComponent } from "src/app/dialogs/edit-restaurant-name-dialog/edit-restaurant-name-dialog.component"
import { EditAddressDialogComponent } from "src/app/dialogs/edit-address-dialog/edit-address-dialog.component"
import * as ErrorCodes from "src/app/errorCodes"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	templateUrl: "./restaurant-page.component.html",
	styleUrl: "./restaurant-page.component.scss",
	standalone: false
})
export class RestaurantPageComponent {
	errorsLocale = this.localizationService.locale.errors
	faLocationDot = faLocationDot
	faPen = faPen
	uuid: string = null
	name: string = ""
	nameError: string = ""
	city: string = ""
	cityError: string = ""
	country: string = ""
	line1: string = ""
	line1Error: string = ""
	line2: string = ""
	line2Error: string = ""
	postalCode: string = ""
	postalCodeError: string = ""

	//#region EditRestaurantNameDialog
	@ViewChild("editRestaurantNameDialog")
	editRestaurantNameDialog: EditRestaurantNameDialogComponent
	editRestaurantNameDialogLoading: boolean = false
	//#endregion

	//#region EditAddressDialog
	@ViewChild("editAddressDialog")
	editAddressDialog: EditAddressDialogComponent
	editAddressDialogLoading: boolean = false
	//#endregion

	constructor(
		private apiService: ApiService,
		private dataService: DataService,
		private activatedRoute: ActivatedRoute,
		private localizationService: LocalizationService
	) {}

	async ngOnInit() {
		this.uuid = this.activatedRoute.snapshot.paramMap.get("uuid")

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
				{ uuid: this.uuid }
			)

		if (retrieveRestaurantResponse.data.retrieveRestaurant == null) return

		this.name = retrieveRestaurantResponse.data.retrieveRestaurant.name
		this.city = retrieveRestaurantResponse.data.retrieveRestaurant.city
		this.country = retrieveRestaurantResponse.data.retrieveRestaurant.country
		this.line1 = retrieveRestaurantResponse.data.retrieveRestaurant.line1
		this.line2 = retrieveRestaurantResponse.data.retrieveRestaurant.line2
		this.postalCode =
			retrieveRestaurantResponse.data.retrieveRestaurant.postalCode
	}

	showEditRestaurantNameDialog() {
		this.editRestaurantNameDialogLoading = false
		this.editRestaurantNameDialog.show()
	}

	showEditAddressDialog() {
		this.editAddressDialogLoading = false
		this.editAddressDialog.show()
	}

	async editRestaurantNameDialogPrimaryButtonClick(event: { name: string }) {
		this.editRestaurantNameDialogLoading = true

		const updateRestaurantResponse = await this.apiService.updateRestaurant(
			`name`,
			{ uuid: this.uuid, name: event.name }
		)

		this.editRestaurantNameDialogLoading = false

		if (updateRestaurantResponse.data?.updateRestaurant != null) {
			const responseData = updateRestaurantResponse.data.updateRestaurant

			this.name = responseData.name

			this.editRestaurantNameDialog.hide()
		} else if (updateRestaurantResponse.errors.length > 0) {
			// Error handling
			let errors = updateRestaurantResponse.errors[0].extensions?.[
				"errors"
			] as string[] | undefined
			if (errors == null) return

			for (const errorCode of errors) {
				switch (errorCode) {
					case ErrorCodes.nameTooShort:
						this.nameError = this.errorsLocale.nameTooShort
						break
					case ErrorCodes.nameTooLong:
						this.nameError = this.errorsLocale.nameTooLong
						break
					default:
						this.nameError = this.errorsLocale.unexpectedError
						break
				}
			}
		}
	}

	async editAddressDialogPrimaryButtonClick(event: {
		city?: string
		line1?: string
		line2?: string
		postalCode?: string
	}) {
		this.editAddressDialogLoading = true

		const updateRestaurantResponse = await this.apiService.updateRestaurant(
			`
				city
				line1
				line2
				postalCode
			`,
			{
				uuid: this.uuid,
				city: event.city ?? "",
				line1: event.line1 ?? "",
				line2: event.line2 ?? "",
				postalCode: event.postalCode ?? "",
				country: "DE"
			}
		)

		this.editAddressDialogLoading = false

		if (updateRestaurantResponse.data?.updateRestaurant != null) {
			const responseData = updateRestaurantResponse.data.updateRestaurant

			this.city = responseData.city ?? ""
			this.line1 = responseData.line1 ?? ""
			this.line2 = responseData.line2 ?? ""
			this.postalCode = responseData.postalCode ?? ""

			this.editAddressDialog.hide()
		} else if (updateRestaurantResponse.errors.length > 0) {
			// Error handling
			let errors = updateRestaurantResponse.errors[0].extensions?.[
				"errors"
			] as string[] | undefined
			if (errors == null) return

			for (const errorCode of errors) {
				switch (errorCode) {
					case ErrorCodes.cityTooLong:
						this.cityError = this.errorsLocale.cityTooLong
						break
					case ErrorCodes.line1TooLong:
						this.line1Error = this.errorsLocale.line1TooLong
						break
					case ErrorCodes.line2TooLong:
						this.line2Error = this.errorsLocale.line2TooLong
						break
					case ErrorCodes.postalCodeInvalid:
						this.postalCodeError = this.errorsLocale.postalCodeInvalid
						break
					default:
						this.cityError = this.errorsLocale.unexpectedError
						break
				}
			}
		}
	}
}
