import { Component, ViewChild } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { faPen, faFolder } from "@fortawesome/pro-regular-svg-icons"
import { AddRoomDialogComponent } from "src/app/dialogs/add-room-dialog/add-room-dialog.component"
import { LocalizationService } from "src/app/services/localization-service"
import { Room } from "src/app/models/Room"

@Component({
	templateUrl: "./rooms-page.component.html",
	styleUrl: "./rooms-page.component.scss",
	standalone: false
})
export class RoomsPageComponent {
	locale = this.localizationService.locale.roomsPage
	faPen = faPen
	faFolder = faFolder

	@ViewChild("addRoomDialog") addRoomDialog!: AddRoomDialogComponent

	uuid: string = ""
	rooms: Room[] = []
	selectedRoom: Room | null = null

	showAllRoomsForm = false
	showAddRoomForm = false
	newRoomName = ""
	newRoomNameError = ""
	newRoomNumber = 1

	newTableNumber = 1
	newTableChairs = 4

	showEditTableForm = false
	editTableIndex = 0
	editTableNumber = 1
	editTableChairs = 4

	constructor(
		private localizationService: LocalizationService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {}

	ngOnInit() {
		this.uuid = this.activatedRoute.snapshot.paramMap.get("uuid")
	}

	showAddRoomDialog() {
		this.addRoomDialog.show()
	}

	openAddRoomForm() {
		this.showAddRoomForm = true
		this.newRoomName = ""
		this.newRoomNumber = this.rooms.length + 1
	}

	closeAddRoomForm() {
		this.showAddRoomForm = false
		this.showAllRoomsForm = true
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

	// Öffnet das Dialogformular zum Bearbeiten
	openEditRoomForm(room: Room) {
		// this.selectedRoom = room
		// // Formular mit bestehenden Werten füllen
		// this.roomName = room.name
		// // Dialog anzeigen, Liste ausblenden
		// this.showAllRoomsForm = false
		// this.showAddRoomForm = true
		// this.addRoomDialog.hide()
	}

	updateRoom() {
		// if (!this.selectedRoom) {
		// 	return
		// }
		// this.selectedRoom.name = this.roomName.trim()
		// // Rücksetzen des Formular-Zustands
		// this.cancelEdit()
	}

	submitRoom() {
		// if (this.selectedRoom) {
		// 	this.updateRoom()
		// } else {
		// 	this.addRoom()
		// }
	}

	cancelEdit() {
		// this.selectedRoom = null
		// this.showAddRoomForm = false
		// this.showAllRoomsForm = true
		// this.visible = false
		// this.roomName = ""
	}

	showTableAdministrationDialog(room: Room) {
		// hinzufügen :roomName für URL
		// this.roomName = room.name
		// const currentUrl = this.router.url
		// this.router.navigateByUrl(`${currentUrl}/${room.name}/tables`)
	}

	// Entfern Einen Tisch und passt die Nummer an
	removeRoom(roomToRemove: Room) {
		// 1) Index des zu entfernenden Tisches ermitteln
		const idx = this.rooms.findIndex(t => t.name === roomToRemove.name)
		if (idx === -1) return // Tisch nicht gefunden

		// 2) löschen
		this.rooms.splice(idx, 1)
		this.cancelEdit()
	}

	navigateBack() {
		this.router.navigate(["user", "restaurants", this.uuid])
	}
}
