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

	owner: string = "TestOwner"
	ownerError: string = ""
	taxNumber: string = "TestTaxNumber"
	taxNumberError: string = ""
	phoneNumber: string = "0179123456789"
	phoneNumberError: string = ""
	mail: string = "testmail@mail.de"
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

			this.name = responseData.name

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

		this.editRestaurantInfoDialogLoading = false

		if (updateRestaurantResponse.data?.updateRestaurant != null) {
			const responseData = updateRestaurantResponse.data.updateRestaurant

			this.city = responseData.city ?? ""
			this.line1 = responseData.line1 ?? ""
			this.line2 = responseData.line2 ?? ""
			this.postalCode = responseData.postalCode ?? ""

			// Update owner, tax number, mail and phone number locally
			this.owner = event.owner ?? this.owner
			this.taxNumber = event.taxNumber ?? this.taxNumber
			this.mail = event.mail ?? this.mail
			this.phoneNumber = event.phoneNumber ?? this.phoneNumber

			this.editRestaurantInfoDialog.hide()
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
