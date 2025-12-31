import {
	Component,
	PLATFORM_ID,
	Inject,
	ViewChild,
	ElementRef,
	Input,
	Output,
	EventEmitter
} from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { Dialog } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"
import { ApiService } from "src/app/services/api-service"
import { Room } from "src/app/models/Room"
import { convertRoomResourceToRoom, showToast } from "src/app/utils"

@Component({
	selector: "app-select-table-dialog",
	templateUrl: "./select-table-dialog.component.html",
	standalone: false
})
export class SelectTableDialogComponent {
	locale = this.localizationService.locale.dialogs.selectTableDialog
	actionsLocale = this.localizationService.locale.actions
	@Input() restaurantUuid: string = ""
	@Input() currentRoomUuid: string = ""
	@Input() currentTableUuid: string = ""
	@Output() primaryButtonClick = new EventEmitter()
	rooms: Room[] = []
	filteredRooms: Room[] = []
	selectedTableUuid: string = null
	searchNumber: string = ""
	consoleActive: boolean = false
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false

	constructor(
		private localizationService: LocalizationService,
		private apiService: ApiService,
		@Inject(PLATFORM_ID) private platformId: object
	) {}

	ngAfterViewInit() {
		if (isPlatformBrowser(this.platformId)) {
			document.body.appendChild(this.dialog.nativeElement)
		}
	}

	ngOnDestroy() {
		if (isPlatformBrowser(this.platformId)) {
			document.body.removeChild(this.dialog.nativeElement)
		}
	}

	async show(searchNumber?: string, consoleActive?: boolean) {
		if (searchNumber !== undefined) {
			this.searchNumber = searchNumber
		}
		if (consoleActive !== undefined) {
			this.consoleActive = consoleActive
		}

		if (this.rooms.length === 0) {
			const listRoomsResponse = await this.apiService.listRooms(
				`
					total
					items {
						uuid
						name
						tables {
							total
							items {
								uuid
								name
							}
						}
					}
				`,
				{ restaurantUuid: this.restaurantUuid }
			)

			if (listRoomsResponse.data?.listRooms.items != null) {
				for (let room of listRoomsResponse.data.listRooms.items) {
					this.rooms.push(convertRoomResourceToRoom(room))
				}
			}
		}

		const shouldAutoSelect = this.filterRoomsBySearchNumber()

		// Wenn Auto-Select aktiviert ist, öffne den Dialog nicht
		if (!shouldAutoSelect) {
			this.visible = true
		}
	}

	hide() {
		this.visible = false
	}

	selectTable(uuid: string) {
		this.selectedTableUuid = uuid
	}

	submit() {
		this.primaryButtonClick.emit({
			uuid: this.selectedTableUuid
		})
	}

	filterRoomsBySearchNumber(): boolean {
		console.log("searchNumber:", this.searchNumber)
		console.log("consoleActive:", this.consoleActive)

		if (!this.consoleActive || !this.searchNumber) {
			// Keine Filterung, zeige alle Räume
			console.log("Showing all rooms - no filter")
			this.filteredRooms = [...this.rooms]
			return false
		}

		// Extrahiere die Nummer aus der Console (z.B. "5" aus "5" oder "5,00 €")
		const searchNum = this.searchNumber.replace(/[^0-9]/g, "")
		console.log("searchNum after replace:", searchNum)

		if (!searchNum || searchNum === "0") {
			console.log("No valid search number")
			this.filteredRooms = [...this.rooms]
			return false
		}

		// Konvertiere zu Number für exakten Vergleich
		const searchNumber = parseInt(searchNum, 10)

		// Filtere Räume und Tische nach der Suchnummer (exakter Match)
		this.filteredRooms = this.rooms
			.map(room => {
				const filteredTables = room.tables.filter(
					table => table.name === searchNumber
				)

				if (filteredTables.length > 0) {
					return {
						...room,
						tables: filteredTables
					}
				}

				return null
			})
			.filter(room => room !== null)

		// Wenn keine Tische gefunden wurden, zeige Toast und öffne Dialog nicht
		const allFilteredTables = this.filteredRooms.flatMap(room => room.tables)
		if (allFilteredTables.length === 0) {
			showToast(
				`Kein Tisch mit Nummer ${searchNumber} gefunden. Bitte Eingabe überprüfen.`
			)
			return true // Dialog nicht öffnen
		}

		// Wenn nur ein Tisch gefunden wurde, wähle ihn automatisch aus
		if (allFilteredTables.length === 1) {
			this.selectedTableUuid = allFilteredTables[0].uuid
			setTimeout(() => {
				this.submit()
			}, 50)
			return true // Dialog soll nicht geöffnet werden
		}

		return false // Dialog soll geöffnet werden
	}
}
