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
import { TakeawayDetails } from "src/app/models/TakeawayDetails"

@Component({
	selector: "app-add-takeaway-dialog",
	templateUrl: "./add-takeaway-dialog.component.html",
	styleUrl: "./add-takeaway-dialog.component.scss",
	standalone: false
})
export class AddTakeawayDialogComponent {
	locale = this.localizationService.locale.dialogs.addTakeawayDialog
	actionsLocale = this.localizationService.locale.actions
	@Input() child: boolean = false
	@Output() primaryButtonClick = new EventEmitter<TakeawayDetails>()
	@Output() dismiss = new EventEmitter<void>()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false
	loading: boolean = false

	name: string = ""
	phoneNumber: string = ""
	addressLine1: string = ""
	addressLine2: string = ""
	houseNumber: string = ""
	postalCode: string = ""
	city: string = ""
	orderType: "delivery" | "pickUp" | "dineIn" = "delivery"

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
		this.resetForm()
		this.visible = true
	}

	hide() {
		this.visible = false
		this.dismiss.emit()
	}

	resetForm() {
		this.name = ""
		this.phoneNumber = ""
		this.addressLine1 = ""
		this.addressLine2 = ""
		this.houseNumber = ""
		this.postalCode = ""
		this.city = ""
		this.orderType = "delivery"
	}

	isFormValid(): boolean {
		return this.name.trim().length > 0
	}

	submit() {
		if (!this.isFormValid()) return

		const takeawayDetails: TakeawayDetails = {
			uuid: crypto.randomUUID(),
			name: this.name.trim(),
			phoneNumber: this.phoneNumber.trim(),
			addressLine1: this.addressLine1.trim(),
			addressLine2: this.addressLine2.trim(),
			houseNumber: this.houseNumber.trim(),
			postalCode: this.postalCode.trim(),
			city: this.city.trim(),
			delivery: this.orderType === "delivery",
			pickUp: this.orderType === "pickUp",
			dineIn: this.orderType === "dineIn"
		}

		this.primaryButtonClick.emit(takeawayDetails)
		this.hide()
	}

	nameTextfieldChange(event: Event) {
		this.name = (event.target as HTMLInputElement).value
	}

	phoneNumberTextfieldChange(event: Event) {
		this.phoneNumber = (event.target as HTMLInputElement).value
	}

	addressLine1TextfieldChange(event: Event) {
		this.addressLine1 = (event.target as HTMLInputElement).value
	}

	addressLine2TextfieldChange(event: Event) {
		this.addressLine2 = (event.target as HTMLInputElement).value
	}

	houseNumberTextfieldChange(event: Event) {
		this.houseNumber = (event.target as HTMLInputElement).value
	}

	postalCodeTextfieldChange(event: Event) {
		this.postalCode = (event.target as HTMLInputElement).value
	}

	cityTextfieldChange(event: Event) {
		this.city = (event.target as HTMLInputElement).value
	}

	orderTypeRadioGroupChange(event: Event) {
		this.orderType = (event as CustomEvent).detail.value as
			| "delivery"
			| "pickUp"
			| "dineIn"
	}
}
