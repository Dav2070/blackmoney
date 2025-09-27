import { Component, ViewChild } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { faFolder } from "@fortawesome/pro-regular-svg-icons"
import { DataService } from "src/app/services/data-service"
import { ApiService } from "src/app/services/api-service"
import { LocalizationService } from "src/app/services/localization-service"
import { AddRoomDialogComponent } from "src/app/dialogs/add-room-dialog/add-room-dialog.component"
import { Room } from "src/app/models/Room"
import { convertRestaurantResourceToRestaurant } from "src/app/utils"

@Component({
	templateUrl: "./rooms-page.component.html",
	styleUrl: "./rooms-page.component.scss",
	standalone: false
})
export class RoomsPageComponent {
	locale = this.localizationService.locale.roomsPage
	faFolder = faFolder

	@ViewChild("addRoomDialog") addRoomDialog!: AddRoomDialogComponent

	uuid: string = null
	loading: boolean = true
	rooms: Room[] = []
	newRoomNameError = ""

	constructor(
		private dataService: DataService,
		private apiService: ApiService,
		private localizationService: LocalizationService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		this.uuid = this.activatedRoute.snapshot.paramMap.get("uuid")

		await this.dataService.davUserPromiseHolder.AwaitResult()

		const retrieveRestaurantResponse =
			await this.apiService.retrieveRestaurant(
				`
					rooms {
						items {
							uuid
							name
						}
					}
				`,
				{ uuid: this.uuid }
			)

		this.loading = false

		const retrieveRestaurantResponseData =
			convertRestaurantResourceToRestaurant(
				retrieveRestaurantResponse.data.retrieveRestaurant
			)

		if (retrieveRestaurantResponseData == null) return

		for (const room of retrieveRestaurantResponseData.rooms) {
			this.rooms.push(room)
		}
	}

	showAddRoomDialog() {
		this.addRoomDialog.show()
	}

	addRoomDialogPrimaryButtonClick(event: { name: string }) {
		const room: Room = {
			uuid: "",
			name: event.name.trim(),
			tables: []
		}

		this.rooms.push(room)
		this.addRoomDialog.hide()
	}

	navigateBack() {
		this.router.navigate(["user", "restaurants", this.uuid])
	}

	navigateToTablePage(event: MouseEvent, room: Room) {
		event.preventDefault()

		this.router.navigate([
			"user",
			"restaurants",
			this.uuid,
			"rooms",
			room.uuid
		])
	}
}
