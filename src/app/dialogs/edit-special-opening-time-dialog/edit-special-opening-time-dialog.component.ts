import {
	Component,
	ElementRef,
	EventEmitter,
	Inject,
	Input,
	Output,
	PLATFORM_ID,
	ViewChild
} from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { Dialog } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"
import { SpecialOpeningTime } from "src/app/models/SpecialOpeningTime"
import { DateTime } from "luxon"

@Component({
	selector: "app-edit-special-opening-time-dialog",
	templateUrl: "./edit-special-opening-time-dialog.component.html",
	styleUrl: "./edit-special-opening-time-dialog.component.scss",
	standalone: false
})
export class EditSpecialOpeningTimeDialogComponent {
	locale = this.localizationService.locale.dialogs.editOpeningTimeDialog
	actionsLocale = this.localizationService.locale.actions
	@Input() loading: boolean = false
	@Input() name: string = ""
	@Input() nameError: string = ""
	@Input() errorMessage: string
	@Output() primaryButtonClick = new EventEmitter()
	@Output() clearErrors = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false
	@Input() startTime1: string = ""
	@Input() endTime1: string = ""
	@Input() startTime2: string = ""
	@Input() endTime2: string = ""
	@Input() startDate: Date = new Date()
	@Input() endDate: Date = new Date()
	ID: string = ""
	timeError: string = ""
	dateError: string = ""

	specialOpeningTime: SpecialOpeningTime = null

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

	show(specialOpeningTime: SpecialOpeningTime) {
		this.name = specialOpeningTime.name
		this.startTime1 = specialOpeningTime.startTime1
		this.endTime1 = specialOpeningTime.endTime1
		this.startTime2 = specialOpeningTime.startTime2
		this.endTime2 = specialOpeningTime.endTime2
		this.startDate = specialOpeningTime.startDate
		this.endDate = specialOpeningTime.endDate
		this.visible = true
	}

	showNew() {
		this.clear()
		this.visible = true
	}

	hide() {
		this.visible = false
	}

	nameTextfieldChange(event: Event) {
		this.name = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	startDatefieldChange(event: Event) {
		this.startDate = (event as CustomEvent).detail.value
		this.onDateChange()
		this.clearErrors.emit()
	}

	endDatefieldChange(event: Event) {
		this.endDate = (event as CustomEvent).detail.value
		this.onDateChange()
		this.clearErrors.emit()
	}

	onDateChange() {
		this.dateError = ""
	}

	onTimeChange() {
		this.timeError = ""
	}

	submit() {
		// Validierung
		if (!this.validateDates()) {
			return
		}

		if (!this.validateTimes()) {
			return
		}

		console.log("ende1")
		this.specialOpeningTime = {
			uuid: this.ID,
			name: this.name,
			startDate: this.startDate,
			endDate: this.endDate,
			startTime1: this.startTime1,
			endTime1: this.endTime1,
			startTime2: this.startTime2,
			endTime2: this.endTime2
		}

		this.primaryButtonClick.emit({
			sonderTage: this.specialOpeningTime
		})
		console.log("ende2")
	}

	validateDates(): boolean {
		this.dateError = ""

		// Prüfe ob Daten ausgefüllt sind
		if (!this.startDate || !this.endDate) {
			this.dateError = this.locale.errors.fillBothDateFields
			return false
		}

		// Prüfe ob endDate >= startDate
		if (
			DateTime.fromJSDate(this.endDate) < DateTime.fromJSDate(this.startDate)
		) {
			this.dateError = this.locale.errors.endDateAfterStartDate
			return false
		}

		return true
	}

	validateTimes(): boolean {
		this.timeError = ""

		// Prüfe ob Zeiten ausgefüllt sind
		if (!this.startTime1 || !this.endTime1) {
			this.timeError = this.locale.errors.fillAllTimeFields
			return false
		}

		// Schließung muss nach Öffnung sein
		if (this.compareTime(this.startTime1, this.endTime1) >= 0) {
			this.timeError = this.locale.errors.closingAfterOpening
			return false
		}

		// Wenn startTime2 oder endTime2 gesetzt ist, müssen beide gesetzt sein
		if (this.startTime2 || this.endTime2) {
			if (!this.startTime2 || !this.endTime2) {
				this.timeError = this.locale.errors.fillAllTimeFields
				return false
			}

			// Zweite Öffnung muss nach erster Schließung sein
			if (this.compareTime(this.endTime1, this.startTime2) >= 0) {
				this.timeError = this.locale.errors.breakAfterOpening
				return false
			}

			// Zweite Schließung muss nach zweiter Öffnung sein
			if (this.compareTime(this.startTime2, this.endTime2) >= 0) {
				this.timeError = this.locale.errors.closingAfterOpening
				return false
			}
		}

		return true
	}

	// Hilfsfunktion zum Vergleichen von Zeitstrings (HH:MM)
	// Gibt zurück: -1 wenn time1 < time2, 0 wenn gleich, 1 wenn time1 > time2
	compareTime(time1: string, time2: string): number {
		if (!time1 || !time2) return 0

		const [h1, m1] = time1.split(":").map(Number)
		const [h2, m2] = time2.split(":").map(Number)

		const minutes1 = h1 * 60 + m1
		const minutes2 = h2 * 60 + m2

		if (minutes1 < minutes2) return -1
		if (minutes1 > minutes2) return 1
		return 0
	}

	clear() {
		this.name = ""
		this.startTime1 = ""
		this.endTime1 = ""
		this.startTime2 = ""
		this.endTime2 = ""
		this.startDate = new Date()
		this.endDate = new Date()
		this.timeError = ""
		this.dateError = ""
	}
}
