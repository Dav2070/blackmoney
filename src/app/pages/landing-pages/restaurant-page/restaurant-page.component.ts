import { Component, ViewChild } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import {
	faPen,
	faPrint,
	faSeat,
	faCashRegister,
	faClock,
	faMap,
	faLocationDot,
	faShop,
	faAddressCard
} from "@fortawesome/pro-regular-svg-icons"
import { EditRestaurantNameDialogComponent } from "src/app/dialogs/edit-restaurant-name-dialog/edit-restaurant-name-dialog.component"
import { EditRestaurantInfoDialogComponent } from "src/app/dialogs/edit-restaurant-info-dialog/edit-restaurant-info-dialog.component"
import { LocalizationService } from "src/app/services/localization-service"
import * as ErrorCodes from "src/app/errorCodes"
import { getGraphQLErrorCodes } from "src/app/utils"
import { Restaurant } from "src/app/models/Restaurant"

@Component({
	templateUrl: "./restaurant-page.component.html",
	styleUrl: "./restaurant-page.component.scss",
	standalone: false
})
export class RestaurantPageComponent {
	locale = this.localizationService.locale.restaurantPage
	errorsLocale = this.localizationService.locale.errors
	actionsLocale = this.localizationService.locale.actions
	faPen = faPen
	faPrint = faPrint
	faSeat = faSeat
	faCashRegister = faCashRegister
	faClock = faClock
	faMap = faMap
	faLocationDot = faLocationDot
	faShop = faShop
	faAddressCard = faAddressCard
	uuid: string = null
	nameError: string = ""
	cityError: string = ""
	line1Error: string = ""
	housenumberError: string = ""
	line2Error: string = ""
	postalCodeError: string = ""

	restaurant: Restaurant = new Restaurant()

	owner: string = ""
	ownerError: string = ""
	taxNumber: string = ""
	taxNumberError: string = ""
	phoneNumber: string = ""
	phoneNumberError: string = ""
	mail: string = ""
	mailError: string = ""

	imageDataUrl: string | null = null
	maxFileSizeBytes = 1080 * 960

	//#region EditRestaurantNameDialog
	@ViewChild("editRestaurantNameDialog")
	editRestaurantNameDialog: EditRestaurantNameDialogComponent
	editRestaurantNameDialogLoading: boolean = false
	//#endregion

	//#region EditRestaurantInfoDialog
	@ViewChild("editRestaurantInfoDialog")
	editRestaurantInfoDialog: EditRestaurantInfoDialogComponent
	editRestaurantInfoDialogLoading: boolean = false
	//#endregion

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

		const retrieveRestaurantResponse =
			await this.apiService.retrieveRestaurant(
				`

					name
					owner
					taxNumber
					mail
					phoneNumber
					address {
						city
						country
						addressLine1
						addressLine2
						housenumber
						postalCode
					}
				`,
				{ uuid: this.uuid }
			)

		if (
			!retrieveRestaurantResponse.data ||
			retrieveRestaurantResponse.data.retrieveRestaurant == null
		)
			return

		this.restaurant.name =
			retrieveRestaurantResponse.data.retrieveRestaurant.name

		this.owner = retrieveRestaurantResponse.data.retrieveRestaurant.owner
		this.taxNumber =
			retrieveRestaurantResponse.data.retrieveRestaurant.taxNumber
		this.mail = retrieveRestaurantResponse.data.retrieveRestaurant.mail
		this.phoneNumber =
			retrieveRestaurantResponse.data.retrieveRestaurant.phoneNumber
		this.restaurant.address =
			retrieveRestaurantResponse.data.retrieveRestaurant.address
	}

	navigateBack() {
		this.router.navigate(["user", "restaurants"])
	}

	navigateToRegistersPage(event: MouseEvent) {
		event.preventDefault()

		this.router.navigate(["user", "restaurants", this.uuid, "registers"])
	}

	navigateToPrintersPage(event: MouseEvent) {
		event.preventDefault()

		this.router.navigate(["user", "restaurants", this.uuid, "printers"])
	}

	navigateToRoomsPage(event: MouseEvent) {
		event.preventDefault()

		this.router.navigate(["user", "restaurants", this.uuid, "rooms"])
	}

	navigateToTimePage(event: MouseEvent) {
		event.preventDefault()

		this.router.navigate(["user", "restaurants", this.uuid, "openingTime"])
	}

	navigateToMenuPage(event: MouseEvent) {
		event.preventDefault()

		this.router.navigate(["user", "restaurants", this.uuid, "menu"])
	}

	showEditRestaurantNameDialog() {
		this.editRestaurantNameDialogLoading = false
		this.editRestaurantNameDialog.show()
	}

	showEditRestaurantInfoDialog() {
		this.editRestaurantInfoDialogLoading = false
		this.editRestaurantInfoDialog.show()
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

			// Create new restaurant object to trigger change detection
			this.restaurant = {
				...this.restaurant,
				name: responseData.name
			}

			this.editRestaurantNameDialog.hide()
		} else {
			const errors = getGraphQLErrorCodes(updateRestaurantResponse)
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

	async editRestaurantInfoDialogPrimaryButtonClick(event: {
		city?: string
		line1?: string
		housenumber?: string
		line2?: string
		postalCode?: string
		owner?: string
		taxNumber?: string
		mail?: string
		phoneNumber?: string
	}) {
		this.editRestaurantInfoDialogLoading = true

		const updateRestaurantResponse = await this.apiService.updateRestaurant(
			`
				address {
					city
					addressLine1
					addressLine2
					housenumber
					postalCode
				}
				owner
				taxNumber
				mail
				phoneNumber
			`,
			{
				uuid: this.uuid,
				city: event.city,
				line1: event.line1,
				housenumber: event.housenumber,
				line2: event.line2,
				postalCode: event.postalCode,
				country: "DE",
				owner: event.owner,
				taxNumber: event.taxNumber,
				mail: event.mail,
				phoneNumber: event.phoneNumber
			}
		)

		this.editRestaurantInfoDialogLoading = false

		if (updateRestaurantResponse.data?.updateRestaurant != null) {
			const responseData = updateRestaurantResponse.data.updateRestaurant

			// Create new address object to trigger change detection
			this.restaurant.address = {
				uuid: this.restaurant.address?.uuid,
				city: responseData.address?.city,
				country: responseData.address?.country,
				addressLine1: responseData.address?.addressLine1,
				addressLine2: responseData.address?.addressLine2,
				housenumber: responseData.address?.housenumber,
				postalCode: responseData.address?.postalCode
			}

			;((this.owner = responseData.owner),
				(this.taxNumber = responseData.taxNumber),
				(this.mail = responseData.mail),
				(this.phoneNumber = responseData.phoneNumber),
				this.editRestaurantInfoDialog.hide())
		} else {
			let errors = getGraphQLErrorCodes(updateRestaurantResponse)
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

	// Input Picture
	triggerFileInput(fileInput: HTMLInputElement) {
		fileInput.click()
	}

	onFileSelected(event: Event) {
		const input = event.target as HTMLInputElement
		if (!input.files || input.files.length === 0) {
			return
		}
		const file = input.files[0]

		// optional: einfache Validierung
		if (!file.type.startsWith("image/")) {
			return
		}
		if (file.size > this.maxFileSizeBytes) {
			// Datei zu groß
			return
		}

		const reader = new FileReader()
		reader.onload = () => {
			this.imageDataUrl = reader.result as string
		}
		reader.readAsDataURL(file)
	}
}
