import { Component, ViewChild } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { faPen, faObjectUnion } from "@fortawesome/pro-regular-svg-icons"
import { EditRoomDialogComponent } from "src/app/dialogs/edit-room-dialog/edit-room-dialog.component"
import { AddTableDialogComponent } from "src/app/dialogs/add-table-dialog/add-table-dialog.component"
import { DataService } from "src/app/services/data-service"
import { ApiService } from "src/app/services/api-service"
import { LocalizationService } from "src/app/services/localization-service"
import { Table } from "src/app/models/Table"
import { Room } from "src/app/models/Room"
import { convertRoomResourceToRoom, getGraphQLErrorCodes } from "src/app/utils"
import * as ErrorCodes from "src/app/errorCodes"

@Component({
	templateUrl: "./room-page.component.html",
	styleUrl: "./room-page.component.scss",
	standalone: false
})
export class RoomPageComponent {
	locale = this.localizationService.locale.roomPage
	errorsLocale = this.localizationService.locale.errors
	faPen = faPen
	faObjectUnion = faObjectUnion
	restaurantUuid: string = null
	roomUuid: string = null

	@ViewChild("editRoomDialog") editRoomDialog!: EditRoomDialogComponent
	editRoomDialogLoading: boolean = false
	editRoomDialogName: string = ""
	editRoomDialogNameError: string = ""

	@ViewChild("addTableDialog") addTableDialog!: AddTableDialogComponent

	room: Room = null
	tables: Table[] = []
	selectedTable: Table | null = null
	loading: boolean = true
	showAllForm = false
	bulkMode = false

	constructor(
		private dataService: DataService,
		private apiService: ApiService,
		private localizationService: LocalizationService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		this.restaurantUuid =
			this.activatedRoute.snapshot.paramMap.get("restaurantUuid")
		this.roomUuid = this.activatedRoute.snapshot.paramMap.get("roomUuid")

		await this.dataService.blackmoneyUserPromiseHolder.AwaitResult()

		const retrieveRoomResponse = await this.apiService.retrieveRoom(
			`
				name
				tables {
					items {
						uuid
						name
						seats
					}
				}
			`,
			{ uuid: this.roomUuid }
		)

		this.loading = false

		const retrieveRoomResponseData = convertRoomResourceToRoom(
			retrieveRoomResponse.data.retrieveRoom
		)

		if (retrieveRoomResponseData == null) return
		this.room = retrieveRoomResponseData

		for (const table of retrieveRoomResponseData.tables) {
			this.tables.push(table)
		}
	}

	showEditRoomDialog() {
		this.editRoomDialogName = this.room.name
		this.editRoomDialogNameError = ""
		this.editRoomDialogLoading = false
		this.editRoomDialog.show()
	}

	async editRoomDialogPrimaryButtonClick(event: { name: string }) {
		const name = event.name.trim()

		if (name.length === 0) {
			this.editRoomDialogNameError = this.errorsLocale.nameMissing
			return
		}

		this.editRoomDialogLoading = true

		const updateRoomResponse = await this.apiService.updateRoom(`name`, {
			uuid: this.roomUuid,
			name
		})

		this.editRoomDialogLoading = false

		if (updateRoomResponse.data?.updateRoom != null) {
			const responseData = updateRoomResponse.data.updateRoom
			this.room.name = responseData.name
			this.editRoomDialog.hide()
		} else {
			const errors = getGraphQLErrorCodes(updateRoomResponse)
			if (errors == null) return

			for (const errorCode of errors) {
				switch (errorCode) {
					case ErrorCodes.nameTooShort:
						this.editRoomDialogNameError = this.errorsLocale.nameTooShort
						break
					case ErrorCodes.nameTooLong:
						this.editRoomDialogNameError = this.errorsLocale.nameTooLong
						break
					default:
						this.editRoomDialogNameError =
							this.errorsLocale.unexpectedError
						break
				}
			}
		}
	}

	showAddTableDialog() {
		this.addTableDialog.show()
	}

	addTableDialogPrimaryButtonClick(event: {
		tableNumber: number
		seats: number
		numberOfTables: number
		bulkMode: boolean
	}) {
		console.log(event)
	}

	// addTable() {
	// 	const table: Table = {
	// 		uuid: "",
	// 		name: this.line1, // Tischnummer
	// 		seats: this.line2 // Anzahl Stühle
	// 	}
	// 	this.tables.push(table)
	// 	this.cancelEdit()
	// }

	// Entfern Einen Tisch
	removeTable(tableToRemove: Table) {
		// 1) Index des zu entfernenden Tisches ermitteln
		const idx = this.tables.findIndex(t => t.name === tableToRemove.name)
		if (idx === -1) return // Tisch nicht gefunden
		// 2) Nummer des entfernten Tisches sichern
		const removedNumber = this.tables[idx].name
		// 3) löschen
		this.tables.splice(idx, 1)
	}

	// Öffnet das Dialogformular zum Bearbeiten
	// openEditForm(table: Table) {
	// 	this.selectedTable = table
	// 	// Formular mit bestehenden Werten füllen
	// 	this.line1 = table.name
	// 	this.line2 = table.seats
	// 	this.showAllForm = false
	// 	this.visible = true
	// }

	// updateTable() {
	// 	if (!this.selectedTable) {
	// 		return
	// 	}
	// 	this.selectedTable.name = this.line1
	// 	this.selectedTable.seats = this.line2
	// 	this.cancelEdit()
	// }

	// submitTable() {
	// 	if (this.selectedTable) {
	// 		this.updateTable()
	// 	} else {
	// 		this.addTable()
	// 	}
	// }

	// cancelEdit() {
	// 	this.line1 = this.getNextTableNumber()
	// 	this.showAllForm = true
	// 	this.visible = false
	// 	this.line2 = 4
	// 	this.line3 = 1
	// }

	// dupplicateTable(table: Table) {
	// 	this.selectedTable = table
	// 	this.line1 = this.getNextTableNumber()
	// 	this.line2 = table.seats
	// 	this.addTable()
	// }

	// multi() {
	// 	this.addMuliTable(this.line1, this.line3)
	// }

	// addMuliTable(Anfang: number, Tischanzahl: number) {
	// 	const start = Number(Anfang)
	// 	const count = Number(Tischanzahl)
	// 	const Anzahl = start + count
	// 	for (let i = Anfang; i < Anzahl; i++) {
	// 		let table: Table = {
	// 			uuid: "",
	// 			name: this.getNextTableNumber(),
	// 			seats: this.line2
	// 		}
	// 		this.tables.push(table)
	// 	}
	// 	this.cancelEdit()
	// }

	// gibt die nächste (höhste) freie Tischnummer
	// getNextTableNumber() {
	// 	let max = 0
	// 	for (const t of this.tables) {
	// 		const num = t.name
	// 		if (!isNaN(num) && num > max) {
	// 			max = num
	// 		}
	// 	}
	// 	return max + 1
	// }

	navigateToTableCombinationsPage(event: MouseEvent) {
		event.preventDefault()

		this.router.navigate([
			"user",
			"restaurants",
			this.restaurantUuid,
			"rooms",
			this.roomUuid,
			"combinations"
		])
	}

	navigateBack() {
		this.router.navigate([
			"user",
			"restaurants",
			this.restaurantUuid,
			"rooms"
		])
	}
}
