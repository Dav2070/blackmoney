import { Component, Inject, PLATFORM_ID, ViewChild } from "@angular/core"
import { Router } from "@angular/router"
import { isPlatformServer } from "@angular/common"
import {
	faGear,
	faArrowRightFromBracket,
	faCashRegister,
	faUsers,
	faShop,
	faCalendarCheck
} from "@fortawesome/pro-regular-svg-icons"
import { LogoutDialogComponent } from "src/app/dialogs/logout-dialog/logout-dialog.component"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { AuthService } from "src/app/services/auth-service"
import { randomNumber } from "src/app/utils"

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
	faCashRegister = faCashRegister
	faUsers = faUsers
	faShop = faShop
	faCalendarCheck = faCalendarCheck
	@ViewChild("logoutDialog")
	logoutDialog: LogoutDialogComponent
	title = ""

	constructor(
		public dataService: DataService,
		private localizationService: LocalizationService,
		private authService: AuthService,
		private router: Router,
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

	navigateToDashboardPage(event: MouseEvent) {
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
}
