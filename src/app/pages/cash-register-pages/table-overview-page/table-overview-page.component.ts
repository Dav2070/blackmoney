import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { isServer } from "src/app/utils"
import { RoomResource } from "src/app/types"

@Component({
	templateUrl: "./table-overview-page.component.html",
	styleUrl: "./table-overview-page.component.scss",
	standalone: false
})
export class TableOverviewPageComponent {
	rooms: RoomResource[] = []
	selected: RoomResource = null

	constructor(
		private apiService: ApiService,
		private router: Router,
		private dataService: DataService
	) {}

	async ngOnInit() {
		if (isServer()) return

		await this.dataService.userPromiseHolder.AwaitResult()

		if (!this.dataService.dav.isLoggedIn) {
			this.router.navigate([""])
			return
		}

		// Check if the user still needs to do the onboarding
		let retrieveCompanyResult = await this.apiService.retrieveCompany(
			`
				uuid
				rooms {
					total
					items {
						name
						tables {
							items {
								uuid
								name
							}
						}
					}
				}
			`
		)

		if (retrieveCompanyResult.data?.retrieveCompany == null) {
			this.router.navigate(["onboarding"])
			return
		}

		if (retrieveCompanyResult.data?.retrieveCompany.rooms?.items != null) {
			for (let roomItem of retrieveCompanyResult.data?.retrieveCompany.rooms
				?.items) {
				this.rooms.push(roomItem)
			}

			if (this.rooms.length > 0) {
				this.selected = this.rooms[0]
			}
		}
	}
}
