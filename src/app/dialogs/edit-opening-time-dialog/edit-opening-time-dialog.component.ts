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
import { FormControl } from "@angular/forms"
import { Day, Block } from "src/app/models/Day"
import { faPlus, faTrash } from "@fortawesome/pro-regular-svg-icons"

@Component({
	selector: "app-edit-opening-time-dialog",
	templateUrl: "./edit-opening-time-dialog.component.html",
	styleUrl: "./edit-opening-time-dialog.component.scss",
	standalone: false
})
export class EditOpeningTimeDialogComponent {
	locale = this.localizationService.locale.dialogs.editOpeningTimeDialog
	actionsLocale = this.localizationService.locale.actions
	faPlus = faPlus
	faTrash = faTrash
	@Input() loading: boolean = false
	@Input() line1: string = ""
	@Input() selectedDay: string = ""
	@Input() line1Error: string = ""
	@Input() errorMessage: string
	@Input() line2: string = ""
	@Input() line2Error: string = ""
	@Output() primaryButtonClick = new EventEmitter()
	@Output() clearErrors = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false
	selectedDays = new FormControl<string[]>([])
	get weekdays(): string[] {
		const weekdaysLocale = this.localizationService.locale.weekdays
		return [
			weekdaysLocale.monday,
			weekdaysLocale.tuesday,
			weekdaysLocale.wednesday,
			weekdaysLocale.thursday,
			weekdaysLocale.friday,
			weekdaysLocale.saturday,
			weekdaysLocale.sunday
		]
	}
	@Input() day: string[] = []
	durchgehend: boolean = false
	pause: boolean = false
	@Input() startTime1: string = ""
	@Input() endTime1: string = ""
	@Input() startTime2: string = ""
	@Input() endTime2: string = ""

	@Input() line1Name: string = ""
	@Input() Tage: string = "t"
	Days: Day[] = []
	blocks: Block[] = []
	blockErrors: Map<number, { timeError?: string }> = new Map()

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

	show(Day: Day[]) {
		this.Days = Day
		this.visible = true
		//this.preselectedDays()
		if (Day.length > 0) {
			this.blocks = this.groupDaysByTime(Day)
		}
	}

	hide() {
		this.visible = false
	}

	line1TextfieldChange(event: Event) {
		this.line1 = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	line2TextfieldChange(event: Event) {
		this.line2 = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	onOpeningTypeChange(block: Block, value: string) {
		if (value === "durchgehend") {
			block.durchgehend = true
			block.pause = false
		} else if (value === "pause") {
			block.durchgehend = false
			block.pause = true
		}
	}

	submit() {
		// Validiere alle Blöcke
		if (!this.validateAllBlocks()) {
			return
		}

		this.saveBlocksToDays()
		this.Days = this.sortDays(this.Days)

		console.log(this.Days)
		this.primaryButtonClick.emit({
			Tage: this.Days
		})
	}

	validateAllBlocks(): boolean {
		this.blockErrors.clear()
		let isValid = true

		this.blocks.forEach((block, index) => {
			const error = this.validateBlock(block)
			if (error) {
				this.blockErrors.set(index, { timeError: error })
				isValid = false
			}
		})

		return isValid
	}

	validateBlock(block: Block): string | null {
		// Prüfe ob Tage ausgewählt wurden
		if (!block.selectedDays || block.selectedDays.length === 0) {
			// Keine Tage ausgewählt ist OK (werden als geschlossen gespeichert)
			return null
		}

		// Prüfe ob Zeiten ausgefüllt sind
		if (!block.startTime1 || !block.endTime1) {
			return this.locale.errors.fillAllTimeFields
		}

		if (block.durchgehend) {
			// Durchgehend: Schließung muss nach Öffnung sein
			if (this.compareTime(block.startTime1, block.endTime1) >= 0) {
				return this.locale.errors.closingAfterOpening
			}
		} else if (block.pause) {
			// Mit Pause: Prüfe alle Zeiten
			if (!block.startTime2 || !block.endTime2) {
				return this.locale.errors.fillAllTimeFields
			}

			// Pause muss nach Öffnung beginnen
			if (this.compareTime(block.startTime1, block.endTime1) >= 0) {
				return this.locale.errors.breakAfterOpening
			}

			// Pause muss vor Schließung enden
			if (this.compareTime(block.startTime2, block.endTime2) >= 0) {
				return this.locale.errors.closingAfterBreak
			}

			// Pause Ende muss nach Pause Beginn sein
			if (this.compareTime(block.endTime1, block.startTime2) >= 0) {
				return this.locale.errors.breakEndAfterBreakStart
			}
		}

		return null
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

	getBlockError(index: number): string | undefined {
		return this.blockErrors.get(index)?.timeError
	}

	onTimeChange() {
		// Lösche Fehler wenn Benutzer Änderungen vornimmt
		this.blockErrors.clear()
	}

	groupDaysByTime(days: Day[]): Block[] {
		const groups: Block[] = []
		// Filtere geschlossene Tage heraus
		const unassigned = [...days].filter(d => !d.geschlossen)

		while (unassigned.length > 0) {
			const ref = unassigned[0]

			const same = unassigned.filter(
				d =>
					d.durchgehend === ref.durchgehend &&
					d.pause === ref.pause &&
					d.startTime1 === ref.startTime1 &&
					d.endTime1 === ref.endTime1 &&
					(d.startTime2 ?? "") === (ref.startTime2 ?? "") &&
					(d.endTime2 ?? "") === (ref.endTime2 ?? "")
			)

			groups.push({
				selectedDays: same.map(d => d.day),
				durchgehend: ref.durchgehend,
				pause: ref.pause,
				startTime1: ref.startTime1,
				endTime1: ref.endTime1,
				startTime2: ref.startTime2 ?? "",
				endTime2: ref.endTime2 ?? ""
			})

			same.forEach(d => {
				const index = unassigned.indexOf(d)
				if (index !== -1) unassigned.splice(index, 1)
			})
		}

		// Falls keine Tage ausgewählt sind (alle geschlossen), erstelle einen leeren Block
		if (groups.length === 0) {
			groups.push({
				selectedDays: [],
				durchgehend: true,
				pause: false,
				startTime1: "",
				endTime1: "",
				startTime2: "",
				endTime2: ""
			})
		}

		return groups
	}

	saveBlocksToDays() {
		this.Days = [] // Array leeren, damit wir neu aufbauen

		// Zuerst sammeln wir alle ausgewählten Tage mit ihren Zeiten
		const selectedDaysMap = new Map<string, Day>()

		this.blocks.forEach(block => {
			if (block.selectedDays && block.selectedDays.length > 0) {
				block.selectedDays.forEach(dayName => {
					const day: Day = {
						day: dayName,
						durchgehend: block.durchgehend,
						pause: block.pause,
						geschlossen: false,
						startTime1: block.startTime1,
						endTime1: block.endTime1,
						startTime2: block.pause ? block.startTime2 : undefined,
						endTime2: block.pause ? block.endTime2 : undefined
					}
					selectedDaysMap.set(dayName, day)
				})
			}
		})

		// Jetzt fügen wir ALLE Wochentage hinzu (in der richtigen Reihenfolge)
		this.weekdays.forEach(dayName => {
			if (selectedDaysMap.has(dayName)) {
				this.Days.push(selectedDaysMap.get(dayName))
			} else {
				// Nicht ausgewählte Tage werden als geschlossen markiert
				const day: Day = {
					day: dayName,
					durchgehend: false,
					pause: false,
					geschlossen: true,
					startTime1: "",
					endTime1: "",
					startTime2: undefined,
					endTime2: undefined
				}
				this.Days.push(day)
			}
		})
	}

	addBlock() {
		if (!this.hasFreeDays()) {
			return
		}

		this.blocks.push({
			selectedDays: [],
			durchgehend: true,
			pause: false,
			startTime1: "",
			endTime1: "",
			startTime2: "",
			endTime2: ""
		})
	}

	removeBlock(index: number) {
		if (this.blocks.length > 1) {
			this.blocks.splice(index, 1)
		}
	}

	hasFreeDays(): boolean {
		const usedDays = this.blocks.flatMap(b => b.selectedDays)
		return usedDays.length < this.weekdays.length
	}

	getAvailableDays(index: number): string[] {
		const selectedInOtherBlocks = this.blocks
			.filter((_, i) => i !== index)
			.flatMap(b => b.selectedDays)
		return this.weekdays.filter(day => !selectedInOtherBlocks.includes(day))
	}

	sortDays(days: Day[]): Day[] {
		return [...days].sort(
			(a, b) => this.weekdays.indexOf(a.day) - this.weekdays.indexOf(b.day)
		)
	}
}
