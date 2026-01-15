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
	selector: "app-edit-restaurant-info-dialog",
	templateUrl: "./edit-restaurant-info-dialog.component.html",
	styleUrl: "./edit-restaurant-info-dialog.component.scss",
	standalone: false
})
export class EditRestaurantInfoDialogComponent {
	locale = this.localizationService.locale.dialogs.editRestaurantInfoDialog
	actionsLocale = this.localizationService.locale.actions
	@Input() loading: boolean = false
	@Input() city: string = ""
	@Input() cityError: string = ""
	@Input() line1: string = ""
	@Input() line1Error: string = ""
	@Input() housenumber: string = ""
	@Input() housenumberError: string = ""
	@Input() line2: string = ""
	@Input() line2Error: string = ""
	@Input() postalCode: string = ""
	@Input() postalCodeError: string = ""
	@Input() owner: string = ""
	@Input() ownerError: string = ""
	@Input() taxNumber: string = ""
	@Input() taxNumberError: string = ""
	@Input() mail: string = ""
	@Input() mailError: string = ""
	@Input() phoneNumber: string = ""
	@Input() phoneNumberError: string = ""
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

	housenumberTextfieldChange(event: Event) {
		this.housenumber = (event as CustomEvent).detail.value
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

	ownerTextfieldChange(event: Event) {
		this.owner = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	taxNumberTextfieldChange(event: Event) {
		this.taxNumber = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	mailTextfieldChange(event: Event) {
		this.mail = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	phoneNumberTextfieldChange(event: Event) {
		this.phoneNumber = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	submit() {
		this.primaryButtonClick.emit({
			city: this.city,
			line1: this.line1,
			housenumber: this.housenumber,
			line2: this.line2,
			postalCode: this.postalCode,
			owner: this.owner,
			taxNumber: this.taxNumber,
			mail: this.mail,
			phoneNumber: this.phoneNumber
		})
	}
}
