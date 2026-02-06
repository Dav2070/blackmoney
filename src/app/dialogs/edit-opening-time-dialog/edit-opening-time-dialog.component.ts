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

@Component({
	selector: "app-edit-opening-time-dialog",
	templateUrl: "./edit-opening-time-dialog.component.html",
	styleUrl: "./edit-opening-time-dialog.component.scss",
	standalone: false
})
export class EditOpeningTimeDialogComponent {
	locale = this.localizationService.locale.dialogs.editOpeningTimeDialog
	actionsLocale = this.localizationService.locale.actions
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
	weekdays = [
		"Montag",
		"Dienstag",
		"Mittwoch",
		"Donnerstag",
		"Freitag",
		"Samstag",
		"Sonntag"
	]
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
		this.saveBlocksToDays()
		this.Days = this.sortDays(this.Days)

		console.log(this.Days)
		this.primaryButtonClick.emit({
			Tage: this.Days
		})
	}

	groupDaysByTime(days: Day[]): Block[] {
		const groups: Block[] = []
		const unassigned = [...days]

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

		return groups
	}

	saveBlocksToDays() {
		this.Days = [] // Array leeren, damit wir neu aufbauen
		this.blocks.forEach(block => {
			block.selectedDays.forEach(dayName => {
				const day: Day = {
					day: dayName,
					durchgehend: block.durchgehend,
					pause: block.pause,
					startTime1: block.startTime1,
					endTime1: block.endTime1,
					startTime2: block.pause ? block.startTime2 : undefined,
					endTime2: block.pause ? block.endTime2 : undefined
				}
				this.Days.push(day)
			})
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
