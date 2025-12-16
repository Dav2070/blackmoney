import { Component, EventEmitter, Input, Output } from "@angular/core"
import {
	faNoteSticky,
	faCupTogo,
	faUtensils
} from "@fortawesome/pro-solid-svg-icons"
import { OrderItem } from "src/app/models/OrderItem"
import { LocalizationService } from "src/app/services/localization-service"
import { formatPrice } from "src/app/utils"
import { PriceCalculator } from "src/app/priceUtils"

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
	@Input() orderItem: OrderItem = null
	@Input() selectedOrderItemUuid: string = null
	@Output() noteIconClick = new EventEmitter<{
		orderItem: OrderItem
	}>()

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
}
