import { Component } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { ApiService } from "src/app/services/api-service"
import { AuthService } from "src/app/services/auth-service"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { SettingsService } from "src/app/services/settings-service"
import {
	getGraphQLErrorCodes,
	getSerialNumber,
	initUserAfterLogin
} from "src/app/utils"

@Component({
	templateUrl: "./set-password-page.component.html",
	styleUrl: "./set-password-page.component.scss",
	standalone: false
})
export class SetPasswordPageComponent {
	locale = this.localizationService.locale.setPasswordPage
	actionsLocale = this.localizationService.locale.actions
	errorsLocale = this.localizationService.locale.errors
	uuid: string = null
	restaurantUuid: string = null
	username: string = null
	password: string = ""
	passwordConfirmation: string = ""
	errorMessage: string = ""
	loading: boolean = false

	constructor(
		private localizationService: LocalizationService,
		private apiService: ApiService,
		private dataService: DataService,
		private authService: AuthService,
		private settingsService: SettingsService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {}

	ngOnInit() {
		this.uuid = this.activatedRoute.snapshot.queryParamMap.get("uuid")
		this.username = this.activatedRoute.snapshot.queryParamMap.get("name")
		this.restaurantUuid =
			this.activatedRoute.snapshot.queryParamMap.get("restaurantUuid")

		if (this.uuid == null || this.username == null) {
			// Redirect back to login page
			this.router.navigate(["login"])
		}
	}

	passwordChange(event: Event) {
		this.password = (event as CustomEvent).detail.value
	}

	passwordConfirmationChange(event: Event) {
		this.passwordConfirmation = (event as CustomEvent).detail.value
	}

	async send() {
		if (this.password.length < 6) {
			this.errorMessage = this.errorsLocale.passwordTooShort
		} else if (this.password !== this.passwordConfirmation) {
			this.errorMessage =
				this.errorsLocale.passwordDoesNotMatchPasswordConfirmation
			return
		}

		this.errorMessage = ""
		this.loading = true

		const setPasswordResponse = await this.apiService.setPasswordForUser(
			`uuid`,
			{
				uuid: this.uuid,
				password: this.password
			}
		)

		if (setPasswordResponse.data?.setPasswordForUser?.uuid != null) {
			// Log in the user
			const loginResponse = await this.apiService.login(
				`
					uuid
					user {
						uuid
						name
						role
					}
				`,
				{
					companyUuid: this.dataService.company.uuid,
					userName: this.username,
					password: this.password,
					registerUuid: "", // TODO: Implement register selection
					registerClientSerialNumber: await getSerialNumber(
						this.settingsService
					)
				}
			)

			const accessToken = loginResponse?.data?.login.uuid

			if (accessToken != null) {
				await initUserAfterLogin(
					accessToken,
					this.restaurantUuid,
					loginResponse.data.login.user,
					this.apiService,
					this.authService,
					this.dataService,
					this.settingsService
				)

				// Redirect to user page
				this.router.navigate(["user"])
			} else {
				// Redirect back to login page
				this.router.navigate(["login"])
			}
		} else {
			const errors = getGraphQLErrorCodes(setPasswordResponse)
			if (errors == null) return

			if (errors.includes("PASSWORD_TOO_SHORT")) {
				this.errorMessage = this.errorsLocale.passwordTooShort
			} else if (errors.includes("PASSWORD_TOO_LONG")) {
				this.errorMessage = this.errorsLocale.passwordTooLong
			} else if (errors.includes("USER_ALREADY_HAS_PASSWORD")) {
				// Redirect back to login page
				this.router.navigate(["login"])
			} else {
				this.errorMessage = this.errorsLocale.unexpectedError
			}
		}

		this.loading = false
	}
}
