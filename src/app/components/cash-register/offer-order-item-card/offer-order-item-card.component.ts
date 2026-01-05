import { Component, EventEmitter, Input, Output } from "@angular/core"
import {
	faNoteSticky,
	faCupTogo,
	faUtensils,
	faChevronDown,
	faChevronUp
} from "@fortawesome/pro-solid-svg-icons"
import { OrderItem } from "src/app/models/OrderItem"
import { OrderItemCard } from "src/app/types/orderItemCard"
import { LocalizationService } from "src/app/services/localization-service"
import { formatPrice } from "src/app/utils"
import { PriceCalculator } from "src/app/models/cash-register/order-item-handling/price-calculator"

@Component({
	selector: "app-offer-order-item-card",
	templateUrl: "./offer-order-item-card.component.html",
	styleUrl: "./offer-order-item-card.component.scss",
	standalone: false
})
export class OfferOrderItemCardComponent {
	locale = this.localizationService.locale.offerOrderItemCard
	formatPrice = formatPrice
	faNoteSticky = faNoteSticky
	faCupTogo = faCupTogo
	faUtensils = faUtensils
	faChevronDown = faChevronDown
	faChevronUp = faChevronUp
	@Input() orderItem: OrderItemCard = null
	@Input() selectedOrderItemUuid: string = null
	@Input() clickable: boolean = false
	@Output() noteIconClick = new EventEmitter<{
		orderItem: OrderItem
	}>()

	private priceCalculator = new PriceCalculator()

	get isExpanded(): boolean {
		return this.orderItem?.isExpanded ?? false
	}

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

	/**
	 * Checks if the OrderItem should be collapsible (has sub-items or discount)
	 */
	isCollapsible(): boolean {
		return (
			this.orderItem.orderItems?.length > 0 ||
			this.calculateDiscountOfOrderItem(this.orderItem) > 0
		)
	}

	/**
	 * Toggles the expanded state
	 */
	toggleExpanded(event: Event) {
		event.stopPropagation()
		if (this.orderItem) {
			this.orderItem.isExpanded = !this.orderItem.isExpanded
		}
	}
}
