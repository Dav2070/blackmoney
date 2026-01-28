import { Component, ElementRef, HostListener, ViewChild } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import {
	faPen,
	faObjectUnion,
	faEllipsis,
	faTrash
} from "@fortawesome/pro-regular-svg-icons"
import { ContextMenu } from "dav-ui-components"
import { EditRoomDialogComponent } from "src/app/dialogs/edit-room-dialog/edit-room-dialog.component"
import { DeleteRoomDialogComponent } from "src/app/dialogs/delete-room-dialog/delete-room-dialog.component"
import { AddTableDialogComponent } from "src/app/dialogs/add-table-dialog/add-table-dialog.component"
import { EditTableDialogComponent } from "src/app/dialogs/edit-table-dialog/edit-table-dialog.component"
import { DeleteTableDialogComponent } from "src/app/dialogs/delete-table-dialog/delete-table-dialog.component"
import { DataService } from "src/app/services/data-service"
import { ApiService } from "src/app/services/api-service"
import { LocalizationService } from "src/app/services/localization-service"
import { Table } from "src/app/models/Table"
import { Room } from "src/app/models/Room"
import {
	convertRoomResourceToRoom,
	convertTableResourceToTable,
	getGraphQLErrorCodes
} from "src/app/utils"
import * as ErrorCodes from "src/app/errorCodes"

@Component({
	templateUrl: "./room-page.component.html",
	styleUrl: "./room-page.component.scss",
	standalone: false
})
export class RoomPageComponent {
	locale = this.localizationService.locale.roomPage
	actionsLocale = this.localizationService.locale.actions
	errorsLocale = this.localizationService.locale.errors
	faPen = faPen
	faObjectUnion = faObjectUnion
	faEllipsis = faEllipsis
	faTrash = faTrash
	restaurantUuid: string = null
	roomUuid: string = null

	@ViewChild("editRoomDialog") editRoomDialog!: EditRoomDialogComponent
	editRoomDialogLoading: boolean = false
	editRoomDialogName: string = ""
	editRoomDialogNameError: string = ""

	@ViewChild("deleteRoomDialog") deleteRoomDialog!: DeleteRoomDialogComponent
	deleteRoomDialogLoading: boolean = false

	@ViewChild("addTableDialog") addTableDialog!: AddTableDialogComponent
	addTableDialogLoading: boolean = false
	addTableDialogNameError: string = ""
	addTableDialogSeatsError: string = ""

	@ViewChild("editTableDialog") editTableDialog!: EditTableDialogComponent
	editTableDialogLoading: boolean = false
	editTableDialogName: number = 0
	editTableDialogSeats: number = 0
	editTableDialogSeatsError: string = ""

	@ViewChild("deleteTableDialog")
	deleteTableDialog!: DeleteTableDialogComponent
	deleteTableDialogLoading: boolean = false
	deleteTableDialogName: number = 0

	@ViewChild("tableItemContextMenu")
	tableItemContextMenu: ElementRef<ContextMenu>
	tableItemContextMenuVisible: boolean = false
	tableItemContextMenuPositionX: number = 0
	tableItemContextMenuPositionY: number = 0

	room: Room = null
	tables: Table[] = []
	selectedTable: Table = null
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

	@HostListener("document:click", ["$event"])
	documentClick(event: MouseEvent) {
		if (
			!this.tableItemContextMenu.nativeElement.contains(event.target as Node)
		) {
			this.tableItemContextMenuVisible = false
		}
	}

	showEditRoomDialog() {
		this.editRoomDialogName = this.room.name
		this.editRoomDialogNameError = ""
		this.editRoomDialogLoading = false
		this.editRoomDialog.show()
	}

	showDeleteRoomDialog() {
		this.tableItemContextMenuVisible = false
		this.deleteRoomDialog.show()
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

	async deleteRoomDialogPrimaryButtonClick() {
		this.deleteRoomDialogLoading = true

		const deleteRoomResponse = await this.apiService.deleteRoom(`uuid`, {
			uuid: this.roomUuid
		})

		this.deleteRoomDialogLoading = false

		if (deleteRoomResponse.data?.deleteRoom != null) {
			this.router.navigate([
				"dashboard",
				"restaurants",
				this.restaurantUuid,
				"rooms"
			])
		}
	}

	showAddTableDialog() {
		this.addTableDialog.show()
	}

	async addTableDialogPrimaryButtonClick(event: {
		name: number
		seats: number
		numberOfTables: number
		bulkMode: boolean
	}) {
		if (event.bulkMode) {
			this.addTableDialogLoading = true

			for (let i = event.name; i < event.name + event.numberOfTables; i++) {
				const createTableResponse = await this.apiService.createTable(
					`
						uuid
						name
						seats
					`,
					{
						roomUuid: this.roomUuid,
						name: i,
						seats: event.seats
					}
				)

				if (createTableResponse.data?.createTable != null) {
					const responseData = createTableResponse.data.createTable

					this.tables.push(convertTableResourceToTable(responseData))
				}
			}

			// Sort the tables by name
			this.tables.sort((a, b) => a.name - b.name)

			this.addTableDialogLoading = false
			this.addTableDialog.hide()
		} else {
			this.addTableDialogLoading = true

			const createTableResponse = await this.apiService.createTable(
				`
					uuid
					name
					seats
				`,
				{
					roomUuid: this.roomUuid,
					name: event.name,
					seats: event.seats
				}
			)

			this.addTableDialogLoading = false

			if (createTableResponse.data?.createTable != null) {
				const responseData = createTableResponse.data.createTable

				this.tables.push(convertTableResourceToTable(responseData))
				this.addTableDialog.hide()
			} else {
				const errors = getGraphQLErrorCodes(createTableResponse)
				if (errors == null) return

				for (const errorCode of errors) {
					switch (errorCode) {
						case ErrorCodes.tableNameInvalid:
							this.addTableDialogNameError =
								this.errorsLocale.tableNameInvalid
							break
						case ErrorCodes.seatsInvalid:
							this.addTableDialogSeatsError =
								this.errorsLocale.seatsInvalid
							break
						case ErrorCodes.tableAlreadyExists:
							this.addTableDialogNameError =
								this.errorsLocale.tableAlreadyExists
							break
						default:
							this.addTableDialogNameError =
								this.errorsLocale.unexpectedError
							break
					}
				}
			}
		}
	}

	showEditTableDialog() {
		if (this.selectedTable == null) return

		this.tableItemContextMenuVisible = false
		this.editTableDialogLoading = false
		this.editTableDialogName = this.selectedTable.name
		this.editTableDialogSeats = this.selectedTable.seats
		this.editTableDialogSeatsError = ""

		this.editTableDialog.show()
	}

	async editTableDialogPrimaryButtonClick(event: { seats: number }) {
		if (this.selectedTable == null) return

		this.editTableDialogLoading = true

		const updateTableResponse = await this.apiService.updateTable(`seats`, {
			uuid: this.selectedTable.uuid,
			seats: event.seats
		})

		this.editTableDialogLoading = false

		if (updateTableResponse.data?.updateTable != null) {
			this.selectedTable.seats = updateTableResponse.data.updateTable.seats
			this.editTableDialog.hide()
		} else {
			this.editTableDialogSeatsError = this.errorsLocale.unexpectedError
		}
	}

	async deleteTableDialogPrimaryButtonClick() {
		if (this.selectedTable == null) return
		this.deleteTableDialogLoading = true

		const deleteTableResponse = await this.apiService.deleteTable(`uuid`, {
			uuid: this.selectedTable.uuid
		})

		if (deleteTableResponse.data?.deleteTable != null) {
			this.removeTable(this.selectedTable)
		}

		this.deleteTableDialogLoading = false
		this.deleteTableDialog.hide()
	}

	showDeleteTableDialog() {
		if (this.selectedTable == null) return

		this.tableItemContextMenuVisible = false
		this.deleteTableDialogName = this.selectedTable.name

		this.deleteTableDialog.show()
	}

	showTableItemContextMenu(event: Event, table: Table) {
		this.selectedTable = table
		const detail = (event as CustomEvent).detail

		if (this.tableItemContextMenuVisible) {
			this.tableItemContextMenuVisible = false
		} else {
			this.tableItemContextMenuPositionX = detail.contextMenuPosition.x
			this.tableItemContextMenuPositionY = detail.contextMenuPosition.y
			this.tableItemContextMenuVisible = true
		}
	}

	// Entfern Einen Tisch
	removeTable(tableToRemove: Table) {
		const i = this.tables.findIndex(t => t.uuid === tableToRemove.uuid)
		if (i === -1) return

		this.tables.splice(i, 1)
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
			"dashboard",
			"restaurants",
			this.restaurantUuid,
			"rooms",
			this.roomUuid,
			"combinations"
		])
	}

	navigateBack() {
		this.router.navigate([
			"dashboard",
			"restaurants",
			this.restaurantUuid,
			"rooms"
		])
	}
}
