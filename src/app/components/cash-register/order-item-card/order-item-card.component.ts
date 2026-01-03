import { Component, EventEmitter, Input, Output } from "@angular/core"
import { OrderItem } from "src/app/models/OrderItem"
import { formatPrice } from "src/app/utils"
import { PriceCalculator } from "src/app/models/cash-register/order-item-handling/price-calculator"
import { OrderItemType } from "src/app/types"
import {
	faNoteSticky,
	faCupTogo,
	faUtensils
} from "@fortawesome/pro-solid-svg-icons"

@Component({
	selector: "app-order-item-card",
	templateUrl: "./order-item-card.component.html",
	styleUrl: "./order-item-card.component.scss",
	standalone: false
})
export class OrderItemCardComponent {
	formatPrice = formatPrice
	faNoteSticky = faNoteSticky
	faCupTogo = faCupTogo
	faUtensils = faUtensils
	@Input() orderItem: OrderItem = null
	@Input() selectedOrderItemUuid: string = null
	@Input() selectedOrderItemNote: string = null
	@Input() clickable: boolean = false
	@Output() noteIconClick = new EventEmitter<{
		orderItem: OrderItem
	}>()

	private priceCalculator = new PriceCalculator()

	/**
	 * Checks if an OrderItem is a diverse item
	 */
	private isDiverseOrderItem(orderItem: OrderItem): boolean {
		return (
			orderItem.type === OrderItemType.DiverseFood ||
			orderItem.type === OrderItemType.DiverseDrink ||
			orderItem.type === OrderItemType.DiverseOther
		)
	}

	getProductNumber(orderItem: OrderItem): string {
		// All diverse items show product number 0
		if (this.isDiverseOrderItem(orderItem)) {
			return "0"
		}
		return orderItem.product.shortcut.toString()
	}

	calculateTotalPriceOfOrderItem(orderItem: OrderItem): number {
		return this.priceCalculator.calculateTotalPrice(orderItem)
	}

	getCombinedVariationNames(orderItemVariation: any): string {
		return orderItemVariation.variationItems
			.map((vi: any) => vi.name)
			.join(", ")
	}

	getTotalVariationPrice(orderItemVariation: any): number {
		return orderItemVariation.variationItems.reduce(
			(sum: number, vi: any) => sum + vi.additionalCost,
			0
		)
	}

	onNoteIconClick(event: Event) {
		event.stopPropagation()
		this.noteIconClick.emit({
			orderItem: this.orderItem
		})
	}
}
