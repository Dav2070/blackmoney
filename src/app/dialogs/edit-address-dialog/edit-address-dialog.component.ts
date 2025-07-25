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
	selector: "app-edit-address-dialog",
	templateUrl: "./edit-address-dialog.component.html",
	standalone: false
})
export class EditAddressDialogComponent {
	locale = this.localizationService.locale.dialogs.editRestaurantDialog
	actionsLocale = this.localizationService.locale.actions
	@Input() loading: boolean = false
	@Input() city: string = ""
	@Input() cityError: string = ""
	@Input() line1: string = ""
	@Input() line1Error: string = ""
	@Input() line2: string = ""
	@Input() line2Error: string = ""
	@Input() postalCode: string = ""
	@Input() postalCodeError: string = ""
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

	cityTextfieldChange(event: Event) {
		this.city = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	line1TextfieldChange(event: Event) {
		this.line1 = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	line2TextfieldChange(event: Event) {
		this.line2 = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	postalCodeTextfieldChange(event: Event) {
		this.postalCode = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	submit() {
		this.primaryButtonClick.emit({
			city: this.city,
			line1: this.line1,
			line2: this.line2,
			postalCode: this.postalCode
		})
	}
}
