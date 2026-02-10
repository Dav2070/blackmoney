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
import { SpecialOpeningTime } from "src/app/models/Day"

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
	@Input() reason: string = ""
	@Input() reasonError: string = ""
	@Input() errorMessage: string
	@Output() primaryButtonClick = new EventEmitter()
	@Output() clearErrors = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false
	durchgehend: boolean = false
	pause: boolean = false
	geschlossen: boolean = false
	@Input() startTime1: string = ""
	@Input() endTime1: string = ""
	@Input() startTime2: string = ""
	@Input() endTime2: string = ""
	@Input() fromDate: string = ""
	@Input() toDate: string = ""
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
		this.reason = specialOpeningTime.reason
		this.startTime1 = specialOpeningTime.startTime1
		this.endTime1 = specialOpeningTime.endTime1
		this.startTime2 = specialOpeningTime.startTime2
		this.endTime2 = specialOpeningTime.endTime2
		this.fromDate = specialOpeningTime.from
		this.toDate = specialOpeningTime.to
		this.durchgehend = specialOpeningTime.durchgehend
		this.pause = specialOpeningTime.pause
		this.geschlossen = specialOpeningTime.geschlossen
		this.visible = true
	}

	showNew() {
		this.clear()
		this.visible = true
	}

	hide() {
		this.visible = false
	}

	reasonTextfieldChange(event: Event) {
		this.reason = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	fromDatefieldChange(event: Event) {
		this.fromDate = (event as CustomEvent).detail.value
		this.onDateChange()
		this.clearErrors.emit()
	}

	toDatefieldChange(event: Event) {
		this.toDate = (event as CustomEvent).detail.value
		this.onDateChange()
		this.clearErrors.emit()
	}

	onDateChange() {
		this.dateError = ""
	}

	onOpeningTypeChange(value: string) {
		if (value === "durchgehend") {
			this.durchgehend = true
			this.pause = false
			this.geschlossen = false
		} else if (value === "pause") {
			this.durchgehend = false
			this.pause = true
			this.geschlossen = false
		} else if (value === "geschlossen") {
			this.durchgehend = false
			this.pause = false
			this.geschlossen = true
		}
		this.onTimeChange()
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
			reason: this.reason,
			from: this.fromDate,
			to: this.toDate,
			durchgehend: this.durchgehend,
			pause: this.pause,
			geschlossen: this.geschlossen,
			startTime1: this.startTime1,
			endTime1: this.endTime1,
			startTime2: this.startTime2,
			endTime2: this.endTime2,
			geschlossenText: "Geschlossen"
		}

		this.primaryButtonClick.emit({
			sonderTage: this.specialOpeningTime
		})
		console.log("ende2")
	}

	validateDates(): boolean {
		this.dateError = ""

		// Prüfe ob Daten ausgefüllt sind
		if (!this.fromDate || !this.toDate) {
			this.dateError = this.locale.errors.fillBothDateFields
			return false
		}

		// Prüfe ob toDate >= fromDate
		if (this.compareDate(this.fromDate, this.toDate) > 0) {
			this.dateError = this.locale.errors.endDateAfterStartDate
			return false
		}

		return true
	}

	validateTimes(): boolean {
		this.timeError = ""

		// Wenn geschlossen, keine Zeitvalidierung nötig
		if (this.geschlossen) {
			return true
		}

		// Prüfe ob Zeiten ausgefüllt sind
		if (!this.startTime1 || !this.endTime1) {
			this.timeError = this.locale.errors.fillAllTimeFields
			return false
		}

		if (this.durchgehend) {
			// Durchgehend: Schließung muss nach Öffnung sein
			if (this.compareTime(this.startTime1, this.endTime1) >= 0) {
				this.timeError = this.locale.errors.closingAfterOpening
				return false
			}
		} else if (this.pause) {
			// Mit Pause: Prüfe alle Zeiten
			if (!this.startTime2 || !this.endTime2) {
				this.timeError = this.locale.errors.fillAllTimeFields
				return false
			}

			// Pause muss nach Öffnung beginnen
			if (this.compareTime(this.startTime1, this.endTime1) >= 0) {
				this.timeError = this.locale.errors.breakAfterOpening
				return false
			}

			// Pause muss vor Schließung enden
			if (this.compareTime(this.startTime2, this.endTime2) >= 0) {
				this.timeError = this.locale.errors.closingAfterBreak
				return false
			}

			// Pause Ende muss nach Pause Beginn sein
			if (this.compareTime(this.endTime1, this.startTime2) >= 0) {
				this.timeError = this.locale.errors.breakEndAfterBreakStart
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

	// Hilfsfunktion zum Vergleichen von Datumsstrings (YYYY-MM-DD)
	// Gibt zurück: -1 wenn date1 < date2, 0 wenn gleich, 1 wenn date1 > date2
	compareDate(date1: string, date2: string): number {
		if (!date1 || !date2) return 0

		const d1 = new Date(date1)
		const d2 = new Date(date2)

		if (d1 < d2) return -1
		if (d1 > d2) return 1
		return 0
	}

	clear() {
		this.reason = ""
		this.startTime1 = ""
		this.endTime1 = ""
		this.startTime2 = ""
		this.endTime2 = ""
		this.fromDate = ""
		this.toDate = ""
		this.durchgehend = true
		this.pause = false
		this.geschlossen = false
		this.timeError = ""
		this.dateError = ""
	}
}
