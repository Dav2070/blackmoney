import { Component, ViewChild } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { ActivateRegisterDialogComponent } from "src/app/dialogs/activate-register-dialog/activate-register-dialog.component"
import { Register } from "src/app/models/Register"
import { RegisterClient } from "src/app/models/RegisterClient"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import {
	convertRegisterResourceToRegister,
	getGraphQLErrorCodes,
	showToast
} from "src/app/utils"

@Component({
	templateUrl: "./register-page.component.html",
	styleUrl: "./register-page.component.scss",
	standalone: false
})
export class RegisterPageComponent {
	locale = this.localizationService.locale.registerPage
	restaurantUuid: string = null
	registerUuid: string = null
	register: Register = null
	registerClients: RegisterClient[] = []
	loading: boolean = true

	//#region ActivateRegisterDialog
	@ViewChild("activateRegisterDialog")
	activateRegisterDialog: ActivateRegisterDialogComponent
	activateRegisterDialogLoading: boolean = false
	//#endregion

	constructor(
		private dataService: DataService,
		private apiService: ApiService,
		private localizationService: LocalizationService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		this.restaurantUuid =
			this.activatedRoute.snapshot.paramMap.get("restaurantUuid")
		this.registerUuid =
			this.activatedRoute.snapshot.paramMap.get("registerUuid")

		await this.dataService.blackmoneyUserPromiseHolder.AwaitResult()

		const retrieveRegisterResponse = await this.apiService.retrieveRegister(
			`
				uuid
				name
				status
				registerClients {
					items {
						uuid
						name
						serialNumber
					}
				}
			`,
			{ uuid: this.registerUuid }
		)

		this.loading = false

		const retrieveRegisterResponseData = convertRegisterResourceToRegister(
			retrieveRegisterResponse.data.retrieveRegister
		)

		if (retrieveRegisterResponseData == null) return
		this.register = retrieveRegisterResponseData

		for (const registerClient of retrieveRegisterResponseData.registerClients) {
			this.registerClients.push(registerClient)
		}
	}

	navigateBack() {
		this.router.navigate([
			"dashboard",
			"restaurants",
			this.restaurantUuid,
			"registers"
		])
	}

	navigateToRegisterClientPage(
		event: MouseEvent,
		registerClient: RegisterClient
	) {
		event.preventDefault()

		this.router.navigate([
			"dashboard",
			"restaurants",
			this.restaurantUuid,
			"registers",
			this.registerUuid,
			"clients",
			registerClient.uuid
		])
	}

	showActivateRegisterDialog() {
		this.activateRegisterDialog.show()
	}

	async activateRegisterDialogPrimaryButtonClick() {
		this.activateRegisterDialogLoading = true

		const activateRegisterResponse = await this.apiService.activateRegister(
			`status`,
			{ uuid: this.registerUuid }
		)

		this.activateRegisterDialogLoading = false

		if (activateRegisterResponse.data?.activateRegister != null) {
			this.register.status =
				activateRegisterResponse.data.activateRegister.status
			showToast(this.locale.activationSuccess)
		} else {
			let errors = getGraphQLErrorCodes(activateRegisterResponse)
			if (errors == null) return

			if (errors.includes("REGISTER_ALREADY_ACTIVE")) {
				this.register.status = "ACTIVE"
			} else {
				showToast(this.locale.activationError)
			}
		}

		this.activateRegisterDialog.hide()
	}
}
