import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { DataService } from "src/app/services/data-service"
import { Room } from "src/app/models/Room"
import { isServer } from "src/app/utils"

@Component({
	templateUrl: "./table-overview-page.component.html",
	styleUrl: "./table-overview-page.component.scss",
	standalone: false
})
export class TableOverviewPageComponent {
	rooms: Room[] = []
	selected: Room = null

	constructor(private router: Router, private dataService: DataService) {}

	async ngOnInit() {
		if (isServer()) return

		await this.dataService.userPromiseHolder.AwaitResult()
		await this.dataService.companyPromiseHolder.AwaitResult()

		if (!this.dataService.dav.isLoggedIn) {
			this.router.navigate([""])
			return
		}

		// Check if the user still needs to do the onboarding
		if (this.dataService.company == null) {
			this.router.navigate(["onboarding"])
			return
		}

		for (let room of this.dataService.company.rooms) {
			this.rooms.push(room)
		}

		if (this.rooms.length > 0) {
			this.selected = this.rooms[0]
		}
	}
}
