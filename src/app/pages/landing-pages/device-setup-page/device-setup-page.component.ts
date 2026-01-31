import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import {
	convertRegisterClientResourceToRegisterClient,
	getGraphQLErrorCodes
} from "src/app/utils"
import * as ErrorCodes from "src/app/errorCodes"

@Component({
	templateUrl: "./device-setup-page.component.html",
	styleUrl: "./device-setup-page.component.scss",
	standalone: false
})
export class DeviceSetupPageComponent {
	locale = this.localizationService.locale.deviceSetupPage
	actionsLocale = this.localizationService.locale.actions
	errorsLocale = this.localizationService.locale.errors
	deviceName: string = ""
	errorMessage: string = ""
	loading: boolean = false

	constructor(
		private dataService: DataService,
		private apiService: ApiService,
		private localizationService: LocalizationService,
		private router: Router
	) {}

	async ngOnInit() {
		await this.dataService.registerClientPromiseHolder.AwaitResult()

		if (
			this.dataService.registerClient == null ||
			this.dataService.registerClient.name != null
		) {
			// Redirect to user page
			this.router.navigate(["dashboard"])
		}
	}

	deviceNameChange(event: Event) {
		this.deviceName = (event as CustomEvent).detail.value
	}

	async saveButtonClick() {
		const deviceName = this.deviceName.trim()

		if (this.deviceName.length === 0) {
			this.errorMessage = this.errorsLocale.nameMissing
			return
		} else if (deviceName.length < 2) {
			this.errorMessage = this.errorsLocale.nameTooShort
			return
		}

		this.errorMessage = ""
		this.loading = true

		const updateRegisterClientResponse =
			await this.apiService.updateRegisterClient(
				`
					uuid
					name
					serialNumber
				`,
				{
					uuid: this.dataService.registerClient.uuid,
					name: deviceName
				}
			)

		this.loading = false

		if (updateRegisterClientResponse.data?.updateRegisterClient != null) {
			const responseData =
				updateRegisterClientResponse.data.updateRegisterClient
			this.dataService.registerClient =
				convertRegisterClientResourceToRegisterClient(responseData)

			// Redirect to user page
			this.router.navigate(["dashboard"])
		} else {
			const errors = getGraphQLErrorCodes(updateRegisterClientResponse)
			if (errors == null) return

			for (const errorCode of errors) {
				switch (errorCode) {
					case ErrorCodes.nameTooShort:
						this.errorMessage = this.errorsLocale.nameTooShort
						break
					case ErrorCodes.nameTooLong:
						this.errorMessage = this.errorsLocale.nameTooLong
						break
					default:
						this.errorMessage = this.errorsLocale.unexpectedError
						break
				}
			}
		}
	}

	skipButtonClick() {
		this.router.navigate(["dashboard"])
	}
}
