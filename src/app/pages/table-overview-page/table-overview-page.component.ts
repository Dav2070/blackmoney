import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { ApiService } from "src/app/services/api-service"
import { AuthService } from "src/app/services/auth-service"
import { isServer } from "src/app/utils"
import { RoomResource } from "src/app/types"

@Component({
	templateUrl: "./table-overview-page.component.html",
	styleUrl: "./table-overview-page.component.scss"
})
export class TableOverviewPageComponent {
	rooms: RoomResource[] = []
	selected: RoomResource = null

	constructor(
		private apiService: ApiService,
		private authService: AuthService,
		private router: Router
	) {}

	async ngOnInit() {
		if (isServer()) return

		if (this.authService.getAccessToken() == null) {
			this.router.navigate(["login"])
			return
		}

		let listRoomsResult = await this.apiService.listRooms(
			`
				items {
					name
					tables {
						items {
							name
						}
					}
				}
			`
		)

		if (listRoomsResult.data?.listRooms != null) {
			for (let roomItem of listRoomsResult.data.listRooms.items) {
				this.rooms.push(roomItem)
			}

			if (this.rooms.length > 0) {
				this.selected = this.rooms[0]
			}
		}
	}
}
