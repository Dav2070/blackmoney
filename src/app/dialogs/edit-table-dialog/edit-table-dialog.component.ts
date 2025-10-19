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

@Component({
	selector: "app-edit-table-dialog",
	templateUrl: "./edit-table-dialog.component.html",
	standalone: false
})
export class EditTableDialogComponent {
	locale = this.localizationService.locale.dialogs.editTableDialog
	actionsLocale = this.localizationService.locale.actions

	visible: boolean = false

	@Input() loading: boolean = false
	@Input() name: number = 0
	@Input() seats: number = 0
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

	seatsTextfieldChange(event: Event) {
		this.seats = Number((event as CustomEvent).detail.value)
	}

	submit() {
		this.primaryButtonClick.emit()
	}
}
