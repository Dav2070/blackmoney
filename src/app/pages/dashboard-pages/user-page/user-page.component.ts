import { Component, Inject, PLATFORM_ID, ViewChild } from "@angular/core"
import { Router } from "@angular/router"
import { isPlatformServer } from "@angular/common"
import {
	faGear,
	faArrowRightFromBracket,
	faMap,
	faUsers,
	faShop,
	faCalendarCheck,
	faBadgeCheck,
	faGears
} from "@fortawesome/pro-regular-svg-icons"
import { LogoutDialogComponent } from "src/app/dialogs/logout-dialog/logout-dialog.component"
import { ActivateRegisterDialogComponent } from "src/app/dialogs/activate-register-dialog/activate-register-dialog.component"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { AuthService } from "src/app/services/auth-service"
import { ApiService } from "src/app/services/api-service"
import {
	getGraphQLErrorCodes,
	navigateToStripeCheckout,
	randomNumber,
	showToast
} from "src/app/utils"

@Component({
	templateUrl: "./user-page.component.html",
	styleUrl: "./user-page.component.scss",
	standalone: false
})
export class UserPageComponent {
	locale = this.localizationService.locale.userPage
	actionsLocale = this.localizationService.locale.actions
	faGear = faGear
	faArrowRightFromBracket = faArrowRightFromBracket
	faMap = faMap
	faUsers = faUsers
	faShop = faShop
	faCalendarCheck = faCalendarCheck
	faBadgeCheck = faBadgeCheck
	faGears = faGears
	@ViewChild("logoutDialog")
	logoutDialog: LogoutDialogComponent
	title = ""

	//#region ActivateRegisterDialog
	@ViewChild("activateRegisterDialog")
	activateRegisterDialog: ActivateRegisterDialogComponent
	activateRegisterDialogLoading: boolean = false
	//#endregion

	constructor(
		public dataService: DataService,
		private localizationService: LocalizationService,
		private authService: AuthService,
		private router: Router,
		private apiService: ApiService,
		@Inject(PLATFORM_ID) private platformId: object
	) {}

	async ngOnInit() {
		if (isPlatformServer(this.platformId)) return

		await this.dataService.blackmoneyUserPromiseHolder.AwaitResult()

		const n = randomNumber(0, this.locale.headlines.length - 1)

		this.title = this.locale.headlines[n].replace(
			"{name}",
			this.dataService.user.name
		)
	}

	showLogoutDialog() {
		this.logoutDialog.show()
	}

	async logout() {
		await this.authService.removeAccessToken()
		this.logoutDialog.hide()
		this.router.navigate([""])
	}

	navigateToLandingOverviewPage() {
		this.router.navigate([""])
	}

	navigateToGeneralSettingsPage(event: MouseEvent) {
		event.preventDefault()

		this.router.navigate(["dashboard", "settings"])
	}

	navigateToTableOverviewPage(event: MouseEvent) {
		event.preventDefault()

		this.router.navigate(["dashboard", "tables"])
	}

	navigateToEmployeesPage(event: MouseEvent) {
		event.preventDefault()

		this.router.navigate(["dashboard", "employees"])
	}

	navigateToRestaurantsPage(event: MouseEvent) {
		event.preventDefault()

		this.router.navigate(["dashboard", "restaurants"])
	}

	navigateToReservationsPage(event: MouseEvent) {
		event.preventDefault()

		this.router.navigate(["dashboard", "reservations"])
	}

	showActivateRegisterDialog() {
		this.activateRegisterDialog.show()
	}

	async activateRegisterDialogPrimaryButtonClick() {
		this.activateRegisterDialogLoading = true

		const activateRegisterResponse = await this.apiService.activateRegister(
			`status`,
			{ uuid: this.dataService.register.uuid }
		)

		if (activateRegisterResponse.data?.activateRegister != null) {
			this.dataService.register.status =
				activateRegisterResponse.data.activateRegister.status
			showToast(this.locale.activationSuccess)
		} else {
			const errors = getGraphQLErrorCodes(activateRegisterResponse)
			if (errors == null) return

			if (errors.includes("REGISTER_ALREADY_ACTIVE")) {
				this.dataService.register.status = "ACTIVE"
			} else if (errors.includes("NO_ACTIVE_SUBSCRIPTION")) {
				await navigateToStripeCheckout(this.apiService)
			} else {
				showToast(this.locale.activationError)
			}
		}

		this.activateRegisterDialog.hide()
	}
}
