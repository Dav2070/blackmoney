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
import { Restaurant } from "src/app/models/Restaurant"
import { Address } from "src/app/models/Address"
import { OrderType, PaymentMethod } from "src/app/types"
import { formatPrice } from "src/app/utils"

@Component({
	selector: "app-confirm-order-dialog",
	templateUrl: "./confirm-order-dialog.component.html",
	styleUrl: "./confirm-order-dialog.component.scss",
	standalone: false
})
export class ConfirmOrderDialogComponent {
	locale = this.localizationService.locale.dialogs.confirmOrderDialog
	actionsLocale = this.localizationService.locale.actions
	faMoneyBill1 = faMoneyBill1
	faCreditCard = faCreditCard
	formatPrice = formatPrice
	@Input() totalPrice: number = 0
	@Output() confirmOrder = new EventEmitter<{
		deliveryType: OrderType
		paymentMethod: PaymentMethod
	}>()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false
	selectedOrderType: OrderType = "DELIVERY"

	// Mock User
	mockUser = {
		uuid: "user-1",
		name: "Max Mustermann",
		address: {
			uuid: "addr-1",
			line1: "Musterstraße",
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
		address: {
			uuid: "addr-2",
			line1: "Italienische Allee",
			line2: "Zum Italiener",
			houseNumber: "45",
			postalCode: "54321",
			city: "München",
			country: "Deutschland"
		},
		images: [],
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

	selectDeliveryType(type: OrderType) {
		this.selectedOrderType = type
	}

	confirmWithPayment(paymentMethod: PaymentMethod) {
		this.confirmOrder.emit({
			deliveryType: this.selectedOrderType,
			paymentMethod
		})
		this.hide()
	}

	get currentAddress(): Address {
		return this.selectedOrderType === "DELIVERY"
			? this.mockUser.address
			: ({
					uuid: this.mockRestaurant.uuid,
					line1: this.mockRestaurant.address.line1,
					houseNumber: this.mockRestaurant.address.houseNumber,
					postalCode: this.mockRestaurant.address.postalCode,
					city: this.mockRestaurant.address.city,
					country: this.mockRestaurant.address.country
				} as Address)
	}

	formatAddress(address: Address): string {
		const parts = []
		if (address.line1) parts.push(address.line1)
		if (address.houseNumber) parts.push(address.houseNumber)
		const line1 = parts.join(" ")

		const parts2 = []
		if (address.postalCode) parts2.push(address.postalCode)
		if (address.city) parts2.push(address.city)
		const line2 = parts2.join(" ")

		return [line1, line2].filter(Boolean).join(", ")
	}
}
