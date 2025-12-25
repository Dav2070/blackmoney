import {
	Component,
	ElementRef,
	Input,
	Output,
	ViewChild,
	EventEmitter,
	Inject,
	PLATFORM_ID
} from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { Dialog } from "dav-ui-components"
import { Table } from "src/app/models/Table"
import { Room } from "src/app/models/Room"
import { LocalizationService } from "src/app/services/localization-service"
import { TimeSlotSuggestion } from "src/app/types"

@Component({
	selector: "app-add-reservation-dialog",
	templateUrl: "./add-reservation-dialog.component.html",
	styleUrl: "./add-reservation-dialog.component.scss",
	standalone: false
})
export class AddReservationDialogComponent {
	locale = this.localizationService.locale.dialogs.addReservationDialog
	actionsLocale = this.localizationService.locale.actions

	currentTab: number = 0

	// Tab 1: Wunsch
	numberOfPeople: number = 2
	reservationDate: string = ""
	reservationTime: string = ""

	// Tab 2: Verfügbarkeit
	isAvailable: boolean = false
	availabilityChecked: boolean = false
	assignedTable: Table = null
	alternativeTimeSlots: TimeSlotSuggestion[] = []
	selectedAlternativeTime: string = null

	// Tab 3: Details
	name: string = ""
	phoneNumber: string = ""
	email: string = ""

	@Input() numberOfPeopleError: string = ""
	@Input() reservationDateError: string = ""
	@Input() reservationTimeError: string = ""
	@Input() nameError: string = ""
	@Input() phoneNumberError: string = ""
	@Input() emailError: string = ""
	@Input() loading: boolean = false
	@Input() rooms: Room[] = []

	@Output() primaryButtonClick = new EventEmitter()
	@Output() clearErrors = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>

	visible: boolean = false

	constructor(
		private localizationService: LocalizationService,
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

	show() {
		this.visible = true
		this.resetForm()
	}

	hide() {
		this.visible = false
	}

	resetForm() {
		this.currentTab = 0
		this.numberOfPeople = 2
		this.reservationDate = ""
		this.reservationTime = ""
		this.isAvailable = false
		this.availabilityChecked = false
		this.assignedTable = null
		this.alternativeTimeSlots = []
		this.selectedAlternativeTime = null
		this.name = ""
		this.phoneNumber = ""
		this.email = ""
	}

	numberOfPeopleTextfieldChange(event: Event) {
		this.numberOfPeople = Number((event as CustomEvent).detail.value)
		this.clearErrors.emit()
	}

	reservationDateTextfieldChange(event: Event) {
		this.reservationDate = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	reservationTimeTextfieldChange(event: Event) {
		this.reservationTime = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	nameTextfieldChange(event: Event) {
		this.name = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	phoneNumberTextfieldChange(event: Event) {
		this.phoneNumber = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	emailTextfieldChange(event: Event) {
		this.email = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	selectAlternativeTime(timeSlot: TimeSlotSuggestion) {
		this.selectedAlternativeTime = timeSlot.time
		this.reservationTime = timeSlot.time
		this.assignedTable = timeSlot.table
		this.isAvailable = true
	}

	nextTab() {
		if (this.currentTab === 0) {
			// Verfügbarkeit prüfen
			this.checkAvailability()
		}
		if (this.currentTab < 2) {
			this.currentTab++
		}
	}

	previousTab() {
		if (this.currentTab > 0) {
			this.currentTab--
		}
	}

	checkAvailability() {
		// TODO: Ersetze dies mit echtem Backend-Call
		// Mock-Implementierung
		const mockIsAvailable = false

		this.availabilityChecked = true
		this.isAvailable = mockIsAvailable

		if (mockIsAvailable) {
			// Zufall Tisch zuweisen
			const allTables = this.rooms.flatMap(room => room.tables)
			const suitableTables = allTables.filter(
				table => table.seats >= this.numberOfPeople
			)
			if (suitableTables.length > 0) {
				this.assignedTable =
					suitableTables[Math.floor(Math.random() * suitableTables.length)]
			}
		} else {
			// Generiere alternative Zeitvorschläge
			this.generateAlternativeTimeSlots()
		}
	}

	generateAlternativeTimeSlots() {
		const allTables = this.rooms.flatMap(room => room.tables)
		const suitableTables = allTables.filter(
			table => table.seats >= this.numberOfPeople
		)

		this.alternativeTimeSlots = []

		if (suitableTables.length === 0) return

		// Parse die gewünschte Zeit
		const [hours, minutes] = this.reservationTime.split(":")
		let baseHour = parseInt(hours)
		const baseMinutes = parseInt(minutes)

		// Generiere 3-4 alternative Zeitslots
		for (let i = 0; i < 4; i++) {
			let newHour =
				baseHour + (i % 2 === 0 ? 1 : -1) * Math.ceil((i + 1) / 2)
			let newMinutes = baseMinutes

			// Stelle sicher, dass die Zeit gültig ist
			if (newHour < 11) newHour = 11
			if (newHour > 22) newHour = 22

			const timeStr = `${newHour.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`

			// Wähle zufälligen passenden Tisch
			const table =
				suitableTables[Math.floor(Math.random() * suitableTables.length)]

			this.alternativeTimeSlots.push({
				time: timeStr,
				availableSeats: table.seats,
				table: table
			})
		}
	}

	submit() {
		this.primaryButtonClick.emit({
			name: this.name,
			numberOfPeople: this.numberOfPeople,
			phoneNumber: this.phoneNumber,
			email: this.email,
			reservationDate: this.reservationDate,
			reservationTime: this.reservationTime,
			tableUuid: this.assignedTable?.uuid
		})
	}

	get isTab1Valid(): boolean {
		return (
			this.numberOfPeople > 0 &&
			this.reservationDate.length > 0 &&
			this.reservationTime.length > 0
		)
	}

	get isTab2Valid(): boolean {
		return this.isAvailable || this.selectedAlternativeTime != null
	}

	get isFormValid(): boolean {
		return (
			this.isTab1Valid &&
			this.isTab2Valid &&
			this.name.length > 0 &&
			this.assignedTable != null
		)
	}
}
