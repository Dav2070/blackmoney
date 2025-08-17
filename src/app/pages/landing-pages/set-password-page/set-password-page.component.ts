import { Component } from "@angular/core"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	templateUrl: "./set-password-page.component.html",
	styleUrl: "./set-password-page.component.scss",
	standalone: false
})
export class SetPasswordPageComponent {
	locale = this.localizationService.locale.setPasswordPage
	actionsLocale = this.localizationService.locale.actions
	password: string = ""
	passwordConfirmation: string = ""
	loading: boolean = false

	constructor(private localizationService: LocalizationService) {}

	passwordChange(event: Event) {
		this.password = (event as CustomEvent).detail.value
	}

	passwordConfirmationChange(event: Event) {
		this.passwordConfirmation = (event as CustomEvent).detail.value
	}

	send() {
		this.loading = true
	}
}
