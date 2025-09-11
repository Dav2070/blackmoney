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
	selector: "app-add-printer-dialog",
	templateUrl: "./add-printer-dialog.component.html",
	styleUrl: "./add-printer-dialog.component.scss",
	standalone: false
})
export class AddPrinterDialogComponent {
	locale = this.localizationService.locale.dialogs.addPrinterDialog
	actionsLocale = this.localizationService.locale.actions

	name: string = ""
	ipAddress: string = ""

	@Input() nameError: string = ""
	@Input() ipAddressError: string = ""
	@Input() loading: boolean = false

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
	}

	hide() {
		this.visible = false
	}

	nameTextfieldChange(event: Event) {
		this.name = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	ipAddressTextfieldChange(event: Event) {
		this.ipAddress = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	submit() {
		this.primaryButtonClick.emit({
			name: this.name,
			ipAddress: this.ipAddress
		})
	}
}
