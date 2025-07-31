import { Component, Inject, PLATFORM_ID } from "@angular/core"
import { Router } from "@angular/router"
import { isPlatformServer } from "@angular/common"
import { DataService } from "src/app/services/data-service"
import { randomNumber } from "src/app/utils"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	templateUrl: "./user-page.component.html",
	styleUrl: "./user-page.component.scss",
	standalone: false
})
export class UserPageComponent {
	locale = this.localizationService.locale.userPage
	title = ""

	constructor(
		public dataService: DataService,
		private localizationService: LocalizationService,
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

	navigateToDashboardPage(event: MouseEvent) {
		event.preventDefault()

		this.router.navigate(["dashboard"])
	}

	navigateToEmployeesPage(event: MouseEvent) {
		event.preventDefault()

		this.router.navigate(["user", "employees"])
	}

	navigateToRestaurantsPage(event: MouseEvent) {
		event.preventDefault()

		this.router.navigate(["user", "restaurants"])
	}
}
