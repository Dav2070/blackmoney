import { Component, ViewChild, ElementRef, HostListener } from "@angular/core"
import { Router } from "@angular/router"
import {
	faCheckCircle,
	faChevronLeft,
	faChevronRight,
	faEllipsis,
	faTrash,
	faPen
} from "@fortawesome/pro-regular-svg-icons"
import { DateTime } from "luxon"
import { Calendar, ContextMenu } from "dav-ui-components"
import { DataService } from "src/app/services/data-service"
import { ApiService } from "src/app/services/api-service"
import { LocalizationService } from "src/app/services/localization-service"
import { Room } from "src/app/models/Room"
import {
	AddReservationDialogComponent,
	AddReservationData
} from "src/app/dialogs/add-reservation-dialog/add-reservation-dialog.component"
import {
	EditReservationDialogComponent,
	EditReservationData
} from "src/app/dialogs/edit-reservation-dialog/edit-reservation-dialog.component"
import { Reservation } from "src/app/models/Reservation"
import { convertReservationResourceToReservation } from "src/app/utils"

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
	reservations: Reservation[] = []
	loading: boolean = true
	selectedDate: Date = new Date()
	showCalendar: boolean = false
	rooms: Room[] = []

	reservationContextMenuVisible = false
	reservationContextMenuX = 0
	reservationContextMenuY = 0
	selectedReservationForContext: Reservation = null
	checkedInLoadingUuid: string = null

	@ViewChild("calendar")
	calendar: ElementRef<Calendar>

	@ViewChild("addReservationDialog")
	addReservationDialog: AddReservationDialogComponent

	@ViewChild("editReservationDialog")
	editReservationDialog: EditReservationDialogComponent

	@ViewChild("reservationContextMenu")
	reservationContextMenu!: ElementRef<ContextMenu>

	constructor(
		private dataService: DataService,
		private apiService: ApiService,
		private localizationService: LocalizationService,
		private router: Router
	) {}

	async ngOnInit() {
		await this.dataService.blackmoneyUserPromiseHolder.AwaitResult()
		await this.loadReservations()
	}

	getSelectedDateString(): string {
		return this.selectedDate.toISOString()
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

	navigateBack() {
		this.router.navigate(["user"])
	}

	async loadReservations() {
		this.loading = true

		const listReservationsResponse = await this.apiService.listReservations(
			`
				items {
					uuid
					table {
						uuid
						name
					}
					name
					phoneNumber
					email
					numberOfPeople
					date
					checkedIn
				}
			`,
			{
				restaurantUuid: this.dataService.restaurant.uuid,
				date: this.selectedDate.toISOString()
			}
		)

		this.reservations = []

		if (listReservationsResponse.data != null) {
			for (const reservation of listReservationsResponse.data
				.listReservations.items) {
				this.reservations.push(
					convertReservationResourceToReservation(reservation)
				)
			}
		}

		this.loading = false
	}

	showAddReservationDialog() {
		this.addReservationDialog.show()
	}

	addReservationDialogPrimaryButtonClick(event: AddReservationData) {
		// TODO: API-Call zum Erstellen der Reservierung
		console.log("New reservation:", event)

		// Beispiel: Reservierung zur Liste hinzufügen
		const selectedTable = this.rooms
			.flatMap(room => room.tables)
			.find(table => table.uuid === event.tableUuid)

		if (selectedTable) {
			const newReservation: Reservation = {
				uuid: `res-${Date.now()}`,
				table: null,
				name: event.name,
				numberOfPeople: event.numberOfPeople,
				phoneNumber: event.phoneNumber || undefined,
				email: event.email || undefined,
				date: new Date(event.reservationDate),
				checkedIn: false
			}

			this.reservations.push(newReservation)
			this.addReservationDialog.hide()
		}
	}

	editReservationDialogPrimaryButtonClick(event: EditReservationData) {
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
					date: new Date(event.reservationDate),
					table: selectedTable
				}
			}
			this.editReservationDialog.hide()
		}
	}

	async toggleCheckedIn(reservation: Reservation) {
		this.checkedInLoadingUuid = reservation.uuid
		const updateReservationResponse = await this.apiService.updateReservation(
			`
				uuid
				checkedIn
			`,
			{
				uuid: reservation.uuid,
				checkedIn: !reservation.checkedIn
			}
		)

		if (updateReservationResponse.data != null) {
			reservation.checkedIn =
				updateReservationResponse.data.updateReservation.checkedIn
		}

		this.checkedInLoadingUuid = null
	}

	showReservationOptions(event: Event, reservation: Reservation) {
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

		this.loadReservations()
	}

	nextDay() {
		const newDate = new Date(this.selectedDate)
		newDate.setDate(newDate.getDate() + 1)
		this.selectedDate = newDate

		this.loadReservations()
	}

	toggleCalendar() {
		this.calendar.nativeElement.date = DateTime.fromJSDate(this.selectedDate)

		this.showCalendar = !this.showCalendar
	}

	onDateChange(event: Event) {
		const date = (event as CustomEvent).detail.date

		this.selectedDate = new Date(date)
		this.showCalendar = false

		this.loadReservations()
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

	get filteredReservations(): Reservation[] {
		const selected = DateTime.fromJSDate(this.selectedDate)

		return this.reservations.filter(reservation => {
			return DateTime.fromJSDate(reservation.date).hasSame(selected, "day")
		})
	}

	getReservationTime(reservation: Reservation): string {
		const dateTime = DateTime.fromJSDate(reservation.date)
		return dateTime.toFormat("HH:mm")
	}
}
