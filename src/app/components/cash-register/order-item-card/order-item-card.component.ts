import { Component, EventEmitter, Input, Output } from "@angular/core"
import {
	faNoteSticky,
	faCupTogo,
	faUtensils
} from "@fortawesome/pro-solid-svg-icons"
import { OrderItem } from "src/app/models/OrderItem"
import { OrderItemVariation } from "src/app/models/OrderItemVariation"
import { VariationItem } from "src/app/models/VariationItem"
import { PriceCalculator } from "src/app/models/cash-register/order-item-handling/price-calculator"
import { formatPrice } from "src/app/utils"

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

	calculateTotalPriceOfOrderItem(orderItem: OrderItem): number {
		return this.priceCalculator.calculateTotalPrice(orderItem)
	}

	getCombinedVariationNames(orderItemVariation: OrderItemVariation): string {
		return orderItemVariation.variationItems
			.map((vi: VariationItem) => vi.name)
			.join(", ")
	}

	getTotalVariationPrice(orderItemVariation: OrderItemVariation): number {
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
