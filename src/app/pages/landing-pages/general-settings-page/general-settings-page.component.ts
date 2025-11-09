import { Component, ViewChild } from "@angular/core"
import { Router } from "@angular/router"
import { faPen } from "@fortawesome/pro-regular-svg-icons"
import { DropdownOption, DropdownOptionType } from "dav-ui-components"
import { EditDeviceNameDialogComponent } from "src/app/dialogs/edit-device-name-dialog/edit-device-name-dialog.component"
import { LocalizationService } from "src/app/services/localization-service"
import { SettingsService } from "src/app/services/settings-service"
import { ApiService } from "src/app/services/api-service"
import { systemThemeKey, lightThemeKey, darkThemeKey } from "src/app/constants"
import { DataService } from "src/app/services/data-service"
import {
	getGraphQLErrorCodes,
	getSerialNumber,
	convertRegisterClientResourceToRegisterClient
} from "src/app/utils"
import * as ErrorCodes from "src/app/errorCodes"

@Component({
	templateUrl: "./general-settings-page.component.html",
	styleUrl: "./general-settings-page.component.scss",
	standalone: false
})
export class GeneralSettingsPageComponent {
	locale = this.localizationService.locale.settingsPage
	errorsLocale = this.localizationService.locale.errors
	faPen = faPen
	selectedTheme: string = systemThemeKey
	themeDropdownOptions: DropdownOption[] = [
		{
			key: systemThemeKey,
			value: this.locale.systemTheme,
			type: DropdownOptionType.option
		},
		{
			key: lightThemeKey,
			value: this.locale.lightTheme,
			type: DropdownOptionType.option
		},
		{
			key: darkThemeKey,
			value: this.locale.darkTheme,
			type: DropdownOptionType.option
		}
	]
	serialNumber: string = ""

	@ViewChild("editDeviceNameDialog")
	editDeviceNameDialog: EditDeviceNameDialogComponent
	editDeviceNameDialogName: string = ""
	editDeviceNameDialogNameError: string = ""
	editDeviceNameDialogLoading: boolean = false

	constructor(
		private localizationService: LocalizationService,
		private settingsService: SettingsService,
		private apiService: ApiService,
		public dataService: DataService,
		private router: Router
	) {}

	async ngOnInit() {
		this.selectedTheme = await this.settingsService.getTheme()
		this.serialNumber = await getSerialNumber(this.settingsService)
	}

	navigateBack() {
		this.router.navigate(["user"])
	}

	themeDropdownChange(event: Event) {
		let selectedKey = (event as CustomEvent).detail.key

		this.selectedTheme = selectedKey
		this.settingsService.setTheme(selectedKey)
		this.dataService.loadTheme(selectedKey)
	}

	showEditDeviceNameDialog() {
		this.editDeviceNameDialogName =
			this.dataService.registerClient?.name ?? ""
		this.editDeviceNameDialogNameError = ""
		this.editDeviceNameDialog.show()
	}

	async editDeviceNameDialogPrimaryButtonClick(event: { name: string }) {
		const name = event.name.trim()

		if (name.length === 0) {
			this.editDeviceNameDialogNameError = this.errorsLocale.nameMissing
			return
		}

		this.editDeviceNameDialogLoading = true

		const updateRegisterClientResponse =
			await this.apiService.updateRegisterClient(
				`
					uuid
					name
					serialNumber
				`,
				{
					uuid: this.dataService.registerClient.uuid,
					name
				}
			)

		this.editDeviceNameDialogLoading = false

		if (updateRegisterClientResponse.data?.updateRegisterClient != null) {
			const responseData =
				updateRegisterClientResponse.data.updateRegisterClient
			this.dataService.registerClient =
				convertRegisterClientResourceToRegisterClient(responseData)
			this.editDeviceNameDialog.hide()
		} else {
			const errors = getGraphQLErrorCodes(updateRegisterClientResponse)
			if (errors == null) return

			for (const errorCode of errors) {
				switch (errorCode) {
					case ErrorCodes.nameTooShort:
						this.editDeviceNameDialogNameError =
							this.errorsLocale.nameTooShort
						break
					case ErrorCodes.nameTooLong:
						this.editDeviceNameDialogNameError =
							this.errorsLocale.nameTooLong
						break
					default:
						this.editDeviceNameDialogNameError =
							this.errorsLocale.unexpectedError
						break
				}
			}
		}
	}
}
