import { Component, ViewChild } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { AddRegisterDialogComponent } from "src/app/dialogs/add-register-dialog/add-register-dialog.component"
import { Register } from "src/app/models/Register"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import {
	convertRestaurantResourceToRestaurant,
	convertRegisterResourceToRegister,
	getGraphQLErrorCodes
} from "src/app/utils"
import * as ErrorCodes from "src/app/errorCodes"

@Component({
	templateUrl: "./registers-page.component.html",
	styleUrl: "./registers-page.component.scss",
	standalone: false
})
export class RegistersPageComponent {
	locale = this.localizationService.locale.registersPage
	errorsLocale = this.localizationService.locale.errors
	uuid: string = null
	loading: boolean = true
	registers: Register[] = []

	@ViewChild("addRegisterDialog")
	addRegisterDialog: AddRegisterDialogComponent
	addRegisterDialogName: string = ""
	addRegisterDialogNameError: string = ""
	addRegisterDialogLoading: boolean = false

	constructor(
		private dataService: DataService,
		private apiService: ApiService,
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
					registers {
						items {
							uuid
							name
						}
					}
				`,
				{ uuid: this.uuid }
			)

		this.loading = false

		const retrieveRestaurantResponseData =
			convertRestaurantResourceToRestaurant(
				retrieveRestaurantResponse.data.retrieveRestaurant
			)

		if (retrieveRestaurantResponseData == null) return

		for (const register of retrieveRestaurantResponseData.registers) {
			this.registers.push(register)
		}
	}

	navigateBack() {
		this.router.navigate(["user", "restaurants", this.uuid])
	}

	navigateToRegisterPage(event: MouseEvent, register: Register) {
		event.preventDefault()

		this.router.navigate([
			"user",
			"restaurants",
			this.uuid,
			"registers",
			register.uuid
		])
	}

	showAddRegisterDialog() {
		this.addRegisterDialogName = ""
		this.addRegisterDialogNameError = ""
		this.addRegisterDialogLoading = false
		this.addRegisterDialog.show()
	}

	async addRegisterDialogPrimaryButtonClick(event: { name: string }) {
		const name = event.name.trim()

		if (name.length === 0) {
			this.addRegisterDialogNameError = this.errorsLocale.nameMissing
			return
		}

		this.addRegisterDialogLoading = true

		const createRegisterResponse = await this.apiService.createRegister(
			`
				uuid
				name
			`,
			{
				restaurantUuid: this.uuid,
				name
			}
		)

		this.addRegisterDialogLoading = false

		if (createRegisterResponse.data?.createRegister != null) {
			const responseData = createRegisterResponse.data.createRegister
			this.registers.push(convertRegisterResourceToRegister(responseData))
			this.addRegisterDialog.hide()
		} else {
			const errors = getGraphQLErrorCodes(createRegisterResponse)
			if (errors == null) return

			for (const errorCode of errors) {
				switch (errorCode) {
					case ErrorCodes.nameTooShort:
						this.addRegisterDialogNameError =
							this.errorsLocale.nameTooShort
						break
					case ErrorCodes.nameTooLong:
						this.addRegisterDialogNameError =
							this.errorsLocale.nameTooLong
						break
					default:
						this.addRegisterDialogNameError =
							this.errorsLocale.unexpectedError
						break
				}
			}
		}
	}
}
