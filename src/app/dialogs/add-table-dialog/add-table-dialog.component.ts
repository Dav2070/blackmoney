import {
	Component,
	Input,
	Output,
	ViewChild,
	EventEmitter,
	ElementRef,
	Inject,
	PLATFORM_ID
} from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { Dialog } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-add-table-dialog",
	templateUrl: "./add-table-dialog.component.html",
	standalone: false
})
export class AddTableDialogComponent {
	locale = this.localizationService.locale.dialogs.addTableDialog
	actionsLocale = this.localizationService.locale.actions

	visible: boolean = false
	tableNumber: number = 1
	seats: number = 4
	numberOfTables: number = 1
	bulkMode: boolean = false
	multi: boolean = false

	@Input() loading: boolean = false
	@Input() tableNumberError: string = ""
	@Input() seatsError: string = ""
	@Input() numberOfTablesError: string = ""
	@Output() clearErrors = new EventEmitter()
	@Output() primaryButtonClick = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>

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
	}

	hide() {
		this.visible = false
	}

	tableNumberTextfieldChange(event: Event) {
		this.tableNumber = Number((event as CustomEvent).detail.value)
		this.clearErrors.emit()
	}

	seatsTextfieldChange(event: Event) {
		this.seats = Number((event as CustomEvent).detail.value)
		this.clearErrors.emit()
	}

	numberOfTablesTextfieldChange(event: Event) {
		this.numberOfTables = Number((event as CustomEvent).detail.value)
		this.clearErrors.emit()
	}

	toggleBulkMode(event: Event): void {
		this.bulkMode = (event.target as HTMLInputElement).checked
	}

	submit() {
		this.primaryButtonClick.emit({
			tableNumber: this.tableNumber,
			seats: this.seats,
			numberOfTables: this.bulkMode ? this.numberOfTables : 1,
			bulkMode: this.bulkMode
		})
	}
}
