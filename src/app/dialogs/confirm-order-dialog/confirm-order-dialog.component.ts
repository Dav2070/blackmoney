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
import { faMoneyBill1, faCreditCard } from "@fortawesome/pro-regular-svg-icons"
import { Dialog } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"
import { User } from "src/app/models/User"
import { Restaurant } from "src/app/models/Restaurant"
import { Address } from "src/app/models/Address"

@Component({
	selector: "app-confirm-order-dialog",
	templateUrl: "./confirm-order-dialog.component.html",
	styleUrl: "./confirm-order-dialog.component.scss",
	standalone: false
})
export class ConfirmOrderDialogComponent {
	actionsLocale = this.localizationService.locale.actions
	faMoneyBill1 = faMoneyBill1
	faCreditCard = faCreditCard
	@Input() totalPrice: number = 0
	@Output() confirmOrder = new EventEmitter<{
		deliveryType: "delivery" | "pickup"
		paymentMethod: "cash" | "card"
	}>()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false
	selectedDeliveryType: "delivery" | "pickup" = "delivery"

	// Mock User
	mockUser = {
		uuid: "user-1",
		name: "Max Mustermann",
		address: {
			uuid: "addr-1",
			addressLine1: "Musterstraße",
			houseNumber: "123",
			postalCode: "12345",
			city: "Berlin",
			country: "Deutschland"
		}
	}

	// Mock Restaurant
	mockRestaurant: Restaurant = {
		uuid: "rest-1",
		name: "Ristorante Italia",
		city: "Berlin",
		country: "DE",
		line1: "Hauptstraße",
		line2: "42",
		postalCode: "10115",
		menu: null,
		users: [],
		rooms: [],
		registers: [],
		printers: []
	}

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

	selectDeliveryType(type: "delivery" | "pickup") {
		this.selectedDeliveryType = type
	}

	confirmWithPayment(paymentMethod: "cash" | "card") {
		this.confirmOrder.emit({
			deliveryType: this.selectedDeliveryType,
			paymentMethod
		})
		this.hide()
	}

	get currentAddress(): Address {
		return this.selectedDeliveryType === "delivery"
			? this.mockUser.address
			: ({
					uuid: this.mockRestaurant.uuid,
					addressLine1: this.mockRestaurant.line1,
					houseNumber: this.mockRestaurant.line2,
					postalCode: this.mockRestaurant.postalCode,
					city: this.mockRestaurant.city,
					country: this.mockRestaurant.country
				} as Address)
	}

	formatAddress(address: Address): string {
		const parts = []
		if (address.addressLine1) parts.push(address.addressLine1)
		if (address.houseNumber) parts.push(address.houseNumber)
		const line1 = parts.join(" ")

		const parts2 = []
		if (address.postalCode) parts2.push(address.postalCode)
		if (address.city) parts2.push(address.city)
		const line2 = parts2.join(" ")

		return [line1, line2].filter(Boolean).join(", ")
	}
}
