import { Component, ViewChild, ElementRef, HostListener } from "@angular/core"
import { Router } from "@angular/router"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { ReservationDetails } from "src/app/models/ReservationDetails"
import { Table } from "src/app/models/Table"
import { Room } from "src/app/models/Room"
import { AddReservationDialogComponent } from "src/app/dialogs/add-reservation-dialog/add-reservation-dialog.component"
import { EditReservationDialogComponent } from "src/app/dialogs/edit-reservation-dialog/edit-reservation-dialog.component"
import { faEllipsis, faTrash, faPen } from "@fortawesome/free-solid-svg-icons"
import {
	faCheckCircle,
	faChevronLeft,
	faChevronRight
} from "@fortawesome/pro-regular-svg-icons"
import { ContextMenu } from "dav-ui-components"

@Component({
	templateUrl: "./reservations-page.component.html",
	styleUrl: "./reservations-page.component.scss",
	standalone: false
})
export class ReservationsPageComponent {
	locale = this.localizationService.locale.reservationsPage
	actionsLocale = this.localizationService.locale.actions
	faEllipsis = faEllipsis
	faTrash = faTrash
	faPen = faPen
	faCheckCircle = faCheckCircle
	faChevronLeft = faChevronLeft
	faChevronRight = faChevronRight
	reservations: ReservationDetails[] = []
	loading: boolean = false
	selectedDate: Date = new Date()
	showCalendar: boolean = false
	rooms: Room[] = []

	reservationContextMenuVisible = false
	reservationContextMenuX = 0
	reservationContextMenuY = 0
	selectedReservationForContext: ReservationDetails = null

	@ViewChild("addReservationDialog")
	addReservationDialog: AddReservationDialogComponent

	@ViewChild("editReservationDialog")
	editReservationDialog: EditReservationDialogComponent

	@ViewChild("reservationContextMenu")
	reservationContextMenu!: ElementRef<ContextMenu>

	constructor(
		private dataService: DataService,
		private localizationService: LocalizationService,
		private router: Router
	) {
		// Beispieldaten erstellen
		this.createExampleReservations()
		this.createExampleRooms()
	}

	async ngOnInit() {
		await this.dataService.blackmoneyUserPromiseHolder.AwaitResult()
	}

	createExampleReservations() {
		const table1: Table = {
			uuid: "table-1",
			name: 5,
			seats: 4
		}

		const table2: Table = {
			uuid: "table-2",
			name: 12,
			seats: 6
		}

		const table3: Table = {
			uuid: "table-3",
			name: 8,
			seats: 2
		}

		const table4: Table = {
			uuid: "table-4",
			name: 3,
			seats: 4
		}

		const table5: Table = {
			uuid: "table-5",
			name: 7,
			seats: 4
		}

		const table6: Table = {
			uuid: "table-6",
			name: 15,
			seats: 8
		}

		const table7: Table = {
			uuid: "table-7",
			name: 2,
			seats: 2
		}

		const table8: Table = {
			uuid: "table-8",
			name: 10,
			seats: 6
		}

		this.reservations = [
			{
				uuid: "res-1",
				numberOfPeople: 4,
				table: table1,
				reservationDate: new Date(2025, 11, 25),
				reservationTime: "18:00",
				name: "Max Mustermann",
				phoneNumber: "+49 151 12345678",
				email: "max.mustermann@example.com",
				checkedIn: false
			},
			{
				uuid: "res-2",
				numberOfPeople: 2,
				table: table3,
				reservationDate: new Date(2025, 11, 25),
				reservationTime: "19:30",
				name: "Anna Schmidt",
				phoneNumber: "+49 170 98765432",
				email: "anna.schmidt@example.com",
				checkedIn: true
			},
			{
				uuid: "res-3",
				numberOfPeople: 6,
				table: table2,
				reservationDate: new Date(2025, 11, 25),
				reservationTime: "20:00",
				name: "Familie Müller",
				phoneNumber: "+49 160 55555555",
				checkedIn: false
			},
			{
				uuid: "res-4",
				numberOfPeople: 4,
				table: table4,
				reservationDate: new Date(2025, 11, 25),
				reservationTime: "18:30",
				name: "Peter Weber",
				email: "peter.weber@example.com",
				checkedIn: false
			},
			{
				uuid: "res-5",
				numberOfPeople: 3,
				table: table5,
				reservationDate: new Date(2025, 11, 25),
				reservationTime: "17:30",
				name: "Julia Becker",
				phoneNumber: "+49 172 33334444",
				email: "julia.becker@email.de",
				checkedIn: false
			},
			{
				uuid: "res-6",
				numberOfPeople: 8,
				table: table6,
				reservationDate: new Date(2025, 11, 25),
				reservationTime: "21:00",
				name: "Geschäftsessen GmbH",
				phoneNumber: "+49 30 12345678",
				email: "info@geschaeftsessen.de",
				checkedIn: false
			},
			{
				uuid: "res-7",
				numberOfPeople: 2,
				table: table7,
				reservationDate: new Date(2025, 11, 25),
				reservationTime: "19:00",
				name: "Thomas Klein",
				phoneNumber: "+49 176 77778888",
				checkedIn: true
			},
			{
				uuid: "res-8",
				numberOfPeople: 5,
				table: table8,
				reservationDate: new Date(2025, 11, 25),
				reservationTime: "20:30",
				name: "Sarah und Freunde",
				phoneNumber: "+49 163 99990000",
				email: "sarah.meier@mail.com",
				checkedIn: false
			},
			{
				uuid: "res-9",
				numberOfPeople: 4,
				table: table1,
				reservationDate: new Date(2025, 11, 25),
				reservationTime: "22:00",
				name: "Michael Hoffmann",
				email: "m.hoffmann@web.de",
				checkedIn: false
			},
			{
				uuid: "res-10",
				numberOfPeople: 2,
				table: table3,
				reservationDate: new Date(2025, 11, 25),
				reservationTime: "17:00",
				name: "Lisa Wagner",
				phoneNumber: "+49 157 11112222",
				email: "lisa.wagner@example.com",
				checkedIn: true
			}
		]
	}

	createExampleRooms() {
		this.rooms = [
			{
				uuid: "room-1",
				name: "Hauptraum",
				tables: [
					{ uuid: "table-1", name: 5, seats: 4 },
					{ uuid: "table-2", name: 12, seats: 6 },
					{ uuid: "table-4", name: 3, seats: 4 },
					{ uuid: "table-5", name: 7, seats: 4 },
					{ uuid: "table-8", name: 10, seats: 6 }
				]
			},
			{
				uuid: "room-2",
				name: "Nebenraum",
				tables: [
					{ uuid: "table-3", name: 8, seats: 2 },
					{ uuid: "table-7", name: 2, seats: 2 }
				]
			},
			{
				uuid: "room-3",
				name: "Terrasse",
				tables: [{ uuid: "table-6", name: 15, seats: 8 }]
			}
		]
	}

	navigateBack() {
		this.router.navigate(["user"])
	}

	showAddReservationDialog() {
		this.addReservationDialog.show()
	}

	addReservationDialogPrimaryButtonClick(event: any) {
		// TODO: API-Call zum Erstellen der Reservierung
		console.log("New reservation:", event)

		// Beispiel: Reservierung zur Liste hinzufügen
		const selectedTable = this.rooms
			.flatMap(room => room.tables)
			.find(table => table.uuid === event.tableUuid)

		if (selectedTable) {
			const newReservation: ReservationDetails = {
				uuid: `res-${Date.now()}`,
				name: event.name,
				numberOfPeople: event.numberOfPeople,
				phoneNumber: event.phoneNumber || undefined,
				email: event.email || undefined,
				reservationDate: new Date(event.reservationDate),
				reservationTime: event.reservationTime,
				table: selectedTable,
				checkedIn: false
			}

			this.reservations.push(newReservation)
			this.addReservationDialog.hide()
		}
	}

	editReservationDialogPrimaryButtonClick(event: any) {
		// TODO: API-Call zum Aktualisieren der Reservierung
		console.log("Updated reservation:", event)

		// Beispiel: Reservierung in der Liste aktualisieren
		const index = this.reservations.findIndex(r => r.uuid === event.uuid)
		if (index !== -1) {
			const selectedTable = this.rooms
				.flatMap(room => room.tables)
				.find(table => table.uuid === event.tableUuid)

			if (selectedTable) {
				this.reservations[index] = {
					...this.reservations[index],
					name: event.name,
					numberOfPeople: event.numberOfPeople,
					phoneNumber: event.phoneNumber || undefined,
					email: event.email || undefined,
					reservationDate: new Date(event.reservationDate),
					reservationTime: event.reservationTime,
					table: selectedTable
				}
			}
			this.editReservationDialog.hide()
		}
	}

	toggleCheckedIn(reservation: ReservationDetails) {
		reservation.checkedIn = !reservation.checkedIn
	}

	showReservationOptions(event: Event, reservation: ReservationDetails) {
		const detail = (event as CustomEvent).detail
		this.selectedReservationForContext = reservation

		if (this.reservationContextMenuVisible) {
			this.reservationContextMenuVisible = false
		} else {
			this.reservationContextMenuX = detail.contextMenuPosition.x
			this.reservationContextMenuY = detail.contextMenuPosition.y
			this.reservationContextMenuVisible = true
		}
	}

	deleteSelectedReservation() {
		if (!this.selectedReservationForContext) return

		// TODO: API - Delete reservation

		this.reservations = this.reservations.filter(
			r => r.uuid !== this.selectedReservationForContext.uuid
		)
		this.selectedReservationForContext = null
		this.reservationContextMenuVisible = false
	}

	editSelectedReservation() {
		if (!this.selectedReservationForContext) return
		this.editReservationDialog.show(this.selectedReservationForContext)
		this.reservationContextMenuVisible = false
	}

	previousDay() {
		const newDate = new Date(this.selectedDate)
		newDate.setDate(newDate.getDate() - 1)
		this.selectedDate = newDate
	}

	nextDay() {
		const newDate = new Date(this.selectedDate)
		newDate.setDate(newDate.getDate() + 1)
		this.selectedDate = newDate
	}

	toggleCalendar() {
		this.showCalendar = !this.showCalendar
	}

	onDateChange(event: any) {
		const dateValue = event.detail.value
		if (dateValue) {
			this.selectedDate = new Date(dateValue)
			this.showCalendar = false
		}
	}

	getDateLabel(): string {
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const selected = new Date(this.selectedDate)
		selected.setHours(0, 0, 0, 0)

		if (today.getTime() === selected.getTime()) {
			return "Heute"
		}

		const options: Intl.DateTimeFormatOptions = {
			weekday: "short",
			day: "2-digit",
			month: "2-digit",
			year: "numeric"
		}
		return this.selectedDate.toLocaleDateString("de-DE", options)
	}

	getFormattedDateForInput(): string {
		const year = this.selectedDate.getFullYear()
		const month = String(this.selectedDate.getMonth() + 1).padStart(2, "0")
		const day = String(this.selectedDate.getDate()).padStart(2, "0")
		return `${year}-${month}-${day}`
	}

	get filteredReservations(): ReservationDetails[] {
		const selected = new Date(this.selectedDate)
		selected.setHours(0, 0, 0, 0)

		return this.reservations.filter(reservation => {
			const resDate = new Date(reservation.reservationDate)
			resDate.setHours(0, 0, 0, 0)
			return resDate.getTime() === selected.getTime()
		})
	}

	@HostListener("document:click", ["$event"])
	documentClick(event: MouseEvent) {
		// Reservation-Menü schließen, wenn außerhalb geklickt wird
		if (
			this.reservationContextMenuVisible &&
			!this.reservationContextMenu.nativeElement.contains(
				event.target as Node
			)
		) {
			this.reservationContextMenuVisible = false
		}
	}
}
