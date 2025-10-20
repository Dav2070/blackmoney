import { Component, ViewChild } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { faFolder } from "@fortawesome/pro-regular-svg-icons"
import { DataService } from "src/app/services/data-service"
import { ApiService } from "src/app/services/api-service"
import { LocalizationService } from "src/app/services/localization-service"
import { AddRoomDialogComponent } from "src/app/dialogs/add-room-dialog/add-room-dialog.component"
import { Room } from "src/app/models/Room"
import {
	convertRestaurantResourceToRestaurant,
	convertRoomResourceToRoom,
	getGraphQLErrorCodes
} from "src/app/utils"
import * as ErrorCodes from "src/app/errorCodes"

@Component({
	templateUrl: "./rooms-page.component.html",
	styleUrl: "./rooms-page.component.scss",
	standalone: false
})
export class RoomsPageComponent {
	locale = this.localizationService.locale.roomsPage
	errorsLocale = this.localizationService.locale.errors
	faFolder = faFolder

	@ViewChild("addRoomDialog") addRoomDialog!: AddRoomDialogComponent
	addRoomDialogLoading: boolean = false
	addRoomDialogNameError: string = ""

	uuid: string = null
	loading: boolean = true
	rooms: Room[] = []

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

	async addRoomDialogPrimaryButtonClick(event: { name: string }) {
		const name = event.name.trim()

		if (name.length === 0) {
			this.addRoomDialogNameError = this.errorsLocale.nameMissing
			return
		}

		this.addRoomDialogLoading = true

		const createRoomResponse = await this.apiService.createRoom(
			`
				uuid
				name
			`,
			{ name: event.name.trim(), restaurantUuid: this.uuid }
		)

		this.addRoomDialogLoading = false

		if (createRoomResponse.data?.createRoom != null) {
			const responseData = createRoomResponse.data.createRoom

			this.rooms.push(convertRoomResourceToRoom(responseData))

			this.addRoomDialog.hide()
		} else {
			const errors = getGraphQLErrorCodes(createRoomResponse)
			if (errors == null) return

			for (const errorCode of errors) {
				switch (errorCode) {
					case ErrorCodes.nameTooShort:
						this.addRoomDialogNameError = this.errorsLocale.nameTooShort
						break
					case ErrorCodes.nameTooLong:
						this.addRoomDialogNameError = this.errorsLocale.nameTooLong
						break
					default:
						this.addRoomDialogNameError =
							this.errorsLocale.unexpectedError
						break
				}
			}
		}
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
