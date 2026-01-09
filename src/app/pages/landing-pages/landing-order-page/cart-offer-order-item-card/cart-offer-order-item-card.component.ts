import { Component, EventEmitter, Input, Output } from "@angular/core"
import {
	faNoteSticky,
	faCupTogo,
	faUtensils,
	faPlus,
	faMinus,
	faTrash
} from "@fortawesome/pro-solid-svg-icons"
import { OrderItem } from "src/app/models/OrderItem"
import { LocalizationService } from "src/app/services/localization-service"
import { formatPrice } from "src/app/utils"
import { PriceCalculator } from "src/app/models/cash-register/order-item-handling/price-calculator"

@Component({
	selector: "app-cart-offer-order-item-card",
	templateUrl: "./cart-offer-order-item-card.component.html",
	styleUrl: "./cart-offer-order-item-card.component.scss",
	standalone: false
})
export class CartOfferOrderItemCardComponent {
	locale = this.localizationService.locale.landingOrderPage
	discountLocale = this.localizationService.locale.offerOrderItemCard
	formatPrice = formatPrice
	faNoteSticky = faNoteSticky
	faCupTogo = faCupTogo
	faUtensils = faUtensils
	faPlus = faPlus
	faMinus = faMinus
	faTrash = faTrash
	@Input() orderItem: OrderItem = null
	@Input() selectedOrderItemUuid: string = null
	@Input() clickable: boolean = false
	@Output() noteIconClick = new EventEmitter<{
		orderItem: OrderItem
	}>()
	@Output() plusClick = new EventEmitter<OrderItem>()
	@Output() minusClick = new EventEmitter<OrderItem>()
	@Output() addNote = new EventEmitter<OrderItem>()

	private priceCalculator = new PriceCalculator()

	constructor(private localizationService: LocalizationService) {}

	calculateUnitPriceOfOrderItem(orderItem: OrderItem): number {
		const totalPrice = this.priceCalculator.calculateTotalPrice(orderItem)
		return totalPrice / orderItem.count
	}

	calculateTotalPriceOfOrderItem(orderItem: OrderItem): number {
		return this.priceCalculator.calculateTotalPrice(orderItem)
	}

	calculateDiscountOfOrderItem(orderItem: OrderItem): number {
		return this.priceCalculator.calculateDiscount(orderItem)
	}

	onNoteIconClick(event: Event) {
		event.stopPropagation()
		this.noteIconClick.emit({
			orderItem: this.orderItem
		})
	}

	onPlusClick(event: Event) {
		event.stopPropagation()
		this.plusClick.emit(this.orderItem)
	}

	onMinusClick(event: Event) {
		event.stopPropagation()
		this.minusClick.emit(this.orderItem)
	}

	onAddNoteClick(event: Event) {
		event.stopPropagation()
		this.addNote.emit(this.orderItem)
	}
}
