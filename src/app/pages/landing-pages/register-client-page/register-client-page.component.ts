import { Component, ViewChild } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { EditRegisterClientNameDialogComponent } from "src/app/dialogs/edit-register-client-name-dialog/edit-register-client-name-dialog.component"
import { RegisterClient } from "src/app/models/RegisterClient"
import { DataService } from "src/app/services/data-service"
import { ApiService } from "src/app/services/api-service"
import { LocalizationService } from "src/app/services/localization-service"
import {
	getGraphQLErrorCodes,
	convertRegisterClientResourceToRegisterClient
} from "src/app/utils"
import * as ErrorCodes from "src/app/errorCodes"

@Component({
	templateUrl: "./register-client-page.component.html",
	standalone: false
})
export class RegisterClientPageComponent {
	errorsLocale = this.localizationService.locale.errors
	restaurantUuid: string = null
	registerUuid: string = null
	registerClientUuid: string = null
	registerClient: RegisterClient = null

	@ViewChild("editRegisterClientNameDialog")
	editRegisterClientNameDialog: EditRegisterClientNameDialogComponent
	editRegisterClientNameDialogName: string = ""
	editRegisterClientNameDialogNameError: string = ""
	editRegisterClientNameDialogLoading: boolean = false

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
		this.registerClientUuid =
			this.activatedRoute.snapshot.paramMap.get("registerClientUuid")

		await this.dataService.blackmoneyUserPromiseHolder.AwaitResult()

		const retrieveRegisterClientResponse =
			await this.apiService.retrieveRegisterClient(
				`
					uuid
					name
					serialNumber
				`,
				{ uuid: this.registerClientUuid }
			)

		const retrieveRegisterClientResponseData =
			convertRegisterClientResourceToRegisterClient(
				retrieveRegisterClientResponse.data.retrieveRegisterClient
			)

		if (retrieveRegisterClientResponseData == null) return
		this.registerClient = retrieveRegisterClientResponseData
	}

	navigateBack() {
		this.router.navigate([
			"user",
			"restaurants",
			this.restaurantUuid,
			"registers",
			this.registerUuid
		])
	}

	showEditRegisterClientNameDialog() {
		if (this.registerClient == null) return

		this.editRegisterClientNameDialogName = this.registerClient.name
		this.editRegisterClientNameDialogNameError = ""
		this.editRegisterClientNameDialog.show()
	}

	async editRegisterClientNameDialogPrimaryButtonClick(event: {
		name: string
	}) {
		const name = event.name.trim()

		if (name.length === 0) {
			this.editRegisterClientNameDialogNameError =
				this.errorsLocale.nameMissing
			return
		}

		this.editRegisterClientNameDialogLoading = true

		const updateRegisterClientResponse =
			await this.apiService.updateRegisterClient(
				`
					uuid
					name
					serialNumber
				`,
				{
					uuid: this.registerClient.uuid,
					name
				}
			)

		this.editRegisterClientNameDialogLoading = false

		if (updateRegisterClientResponse.data?.updateRegisterClient != null) {
			const responseData =
				updateRegisterClientResponse.data.updateRegisterClient
			this.registerClient =
				convertRegisterClientResourceToRegisterClient(responseData)
			this.editRegisterClientNameDialog.hide()
		} else {
			const errors = getGraphQLErrorCodes(updateRegisterClientResponse)
			if (errors == null) return

			for (const errorCode of errors) {
				switch (errorCode) {
					case ErrorCodes.nameTooShort:
						this.editRegisterClientNameDialogNameError =
							this.errorsLocale.nameTooShort
						break
					case ErrorCodes.nameTooLong:
						this.editRegisterClientNameDialogNameError =
							this.errorsLocale.nameTooLong
						break
					default:
						this.editRegisterClientNameDialogNameError =
							this.errorsLocale.unexpectedError
						break
				}
			}
		}
	}
}
