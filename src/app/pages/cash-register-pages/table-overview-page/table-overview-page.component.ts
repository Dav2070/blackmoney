import { Component, Inject, PLATFORM_ID } from "@angular/core"
import { isPlatformServer } from "@angular/common"
import { Router } from "@angular/router"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { Room } from "src/app/models/Room"

@Component({
	templateUrl: "./table-overview-page.component.html",
	styleUrl: "./table-overview-page.component.scss",
	standalone: false
})
export class TableOverviewPageComponent {
	locale = this.localizationService.locale.tableOverviewPage
	rooms: Room[] = []
	selectedRoom: Room = null
	roomsLoading: boolean = true

	constructor(
		private router: Router,
		private dataService: DataService,
		private localizationService: LocalizationService,
		@Inject(PLATFORM_ID) private platformId: object
	) {}

	async ngOnInit() {
		if (isPlatformServer(this.platformId)) return

		await this.dataService.davUserPromiseHolder.AwaitResult()
		await this.dataService.companyPromiseHolder.AwaitResult()
		await this.dataService.restaurantPromiseHolder.AwaitResult()

		if (!this.dataService.dav.isLoggedIn) {
			this.router.navigate([""])
			return
		}

		// Check if the user still needs to do the onboarding
		if (this.dataService.company == null) {
			this.router.navigate(["onboarding"])
			return
		}

		this.roomsLoading = false

		for (let room of this.dataService.restaurant.rooms) {
			this.rooms.push(room)
		}

		if (this.rooms.length > 0) {
			this.selectedRoom = this.rooms[0]
		}
	}

	navigateToUserPage() {
		this.router.navigate(["user"])
	}

	navigateToTablePage(event: MouseEvent, tableUuid: string) {
		event.preventDefault()
		this.router.navigate(["dashboard", "tables", tableUuid])
	}
}
