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
	selector: "app-edit-takeaway-dialog",
	templateUrl: "./edit-takeaway-dialog.component.html",
	styleUrl: "./edit-takeaway-dialog.component.scss",
	standalone: false
})
export class EditTakeawayDialogComponent {
	locale = this.localizationService.locale.dialogs.editTakeawayDialog
	actionsLocale = this.localizationService.locale.actions
	@Input() child: boolean = false
	@Output() primaryButtonClick = new EventEmitter<TakeawayDetails>()
	@Output() dismiss = new EventEmitter<void>()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false
	loading: boolean = false

	originalUuid: string = ""
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

	show(takeawayDetails: TakeawayDetails) {
		this.originalUuid = takeawayDetails.uuid
		this.name = takeawayDetails.name
		this.phoneNumber = takeawayDetails.phoneNumber
		this.addressLine1 = takeawayDetails.addressLine1
		this.addressLine2 = takeawayDetails.addressLine2
		this.houseNumber = takeawayDetails.houseNumber
		this.postalCode = takeawayDetails.postalCode
		this.city = takeawayDetails.city

		if (takeawayDetails.delivery) {
			this.orderType = "delivery"
		} else if (takeawayDetails.pickUp) {
			this.orderType = "pickUp"
		} else if (takeawayDetails.dineIn) {
			this.orderType = "dineIn"
		}

		this.visible = true
	}

	hide() {
		this.visible = false
		this.dismiss.emit()
	}

	isFormValid(): boolean {
		return this.name.trim().length > 0 && this.phoneNumber.trim().length > 0
	}

	submit() {
		if (!this.isFormValid()) return

		const takeawayDetails: TakeawayDetails = {
			uuid: this.originalUuid,
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
		const value = (event as CustomEvent).detail?.checked
		if (value === "delivery" || value === "pickUp" || value === "dineIn") {
			this.orderType = value
		}
	}
}
