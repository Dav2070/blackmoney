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
		this.clearErrors.emit()
	}

	toDatefieldChange(event: Event) {
		this.toDate = (event as CustomEvent).detail.value
		this.clearErrors.emit()
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
	}

	submit() {
		console.log("ende1")
		this.specialOpeningTime = {
			ID: this.ID,
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
	}
}
