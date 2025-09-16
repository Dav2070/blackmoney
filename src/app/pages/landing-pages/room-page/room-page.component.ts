import {
	Component,
	Input,
	ElementRef,
	EventEmitter,
	Output,
	ViewChild
} from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { faPen } from "@fortawesome/pro-regular-svg-icons"
import { Dialog } from "dav-ui-components"
import { DataService } from "src/app/services/data-service"
import { ApiService } from "src/app/services/api-service"
import { LocalizationService } from "src/app/services/localization-service"
import { Table } from "src/app/models/Table"
import { Room } from "src/app/models/Room"
import { convertRoomResourceToRoom } from "src/app/utils"

@Component({
	templateUrl: "./room-page.component.html",
	styleUrl: "./room-page.component.scss",
	standalone: false
})
export class RoomPageComponent {
	tablesLocale = this.localizationService.locale.roomPage
	actionsLocale = this.localizationService.locale.actions
	locale = this.localizationService.locale.dialogs.addTableDialog
	faPen = faPen
	restaurantUuid: string = null
	roomUuid: string = null

	room: Room = null
	tables: Table[] = []
	selectedTable: Table | null = null
	loading: boolean = true
	showAllForm = false
	bulkMode = false

	@Input() line1: number = this.getNextTableNumber()
	@Input() line1Error: string = ""
	@Input() line2: number = 4
	@Input() line3: number = 1
	@Input() line2Error: string = ""
	@Output() clearErrors = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false

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

	tableIdNumberfieldChange(event: Event) {
		this.line1 = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	chairNumberfieldChange(event: Event) {
		this.line2 = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	tableNumberfieldChange(event: Event) {
		this.line3 = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	addTable() {
		const table: Table = {
			uuid: "",
			name: this.line1, // Tischnummer
			seats: this.line2 // Anzahl Stühle
		}
		this.tables.push(table)
		this.cancelEdit()
	}

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
	openEditForm(table: Table) {
		this.selectedTable = table
		// Formular mit bestehenden Werten füllen
		this.line1 = table.name
		this.line2 = table.seats
		this.showAllForm = false
		this.visible = true
	}

	updateTable() {
		if (!this.selectedTable) {
			return
		}
		this.selectedTable.name = this.line1
		this.selectedTable.seats = this.line2
		this.cancelEdit()
	}

	submitTable() {
		if (this.selectedTable) {
			this.updateTable()
		} else {
			this.addTable()
		}
	}

	cancelEdit() {
		this.line1 = this.getNextTableNumber()
		this.showAllForm = true
		this.visible = false
		this.line2 = 4
		this.line3 = 1
	}

	dupplicateTable(table: Table) {
		this.selectedTable = table
		this.line1 = this.getNextTableNumber()
		this.line2 = table.seats
		this.addTable()
	}

	show() {
		this.visible = true
	}

	hide() {
		this.visible = false
	}

	toggleBulkMode(event: Event): void {
		const isChecked = (event.target as HTMLInputElement).checked
		this.bulkMode = isChecked
	}

	multi() {
		this.addMuliTable(this.line1, this.line3)
	}

	addMuliTable(Anfang: number, Tischanzahl: number) {
		const start = Number(Anfang)
		const count = Number(Tischanzahl)
		const Anzahl = start + count
		for (let i = Anfang; i < Anzahl; i++) {
			let table: Table = {
				uuid: "",
				name: this.getNextTableNumber(),
				seats: this.line2
			}
			this.tables.push(table)
		}
		this.cancelEdit()
	}

	showTableCombinationDialog() {
		const currentUrl = this.router.url
		this.router.navigateByUrl(`${currentUrl}/combinations`)
	}

	// gibt die nächste (höhste) freie Tischnummer
	getNextTableNumber() {
		let max = 0
		for (const t of this.tables) {
			const num = t.name
			if (!isNaN(num) && num > max) {
				max = num
			}
		}
		return max + 1
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
