import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	templateUrl: "./device-setup-page.component.html",
	styleUrl: "./device-setup-page.component.scss",
	standalone: false
})
export class DeviceSetupPageComponent {
	locale = this.localizationService.locale.deviceSetupPage
	actionsLocale = this.localizationService.locale.actions
	loading: boolean = false

	constructor(
		private localizationService: LocalizationService,
		private router: Router
	) {}

	skipButtonClick() {
		this.router.navigate(["user"])
	}

	saveButtonClick() {
		this.loading = true
	}
}
