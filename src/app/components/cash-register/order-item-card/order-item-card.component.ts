import { Component, EventEmitter, Input, Output } from "@angular/core"
import { OrderItemType } from "src/app/types"
import {
	faNoteSticky,
	faCupTogo,
	faUtensils,
	faChevronDown,
	faChevronUp
} from "@fortawesome/pro-solid-svg-icons"
import { OrderItem } from "src/app/models/OrderItem"
import { OrderItemCard } from "src/app/types/orderItemCard"
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
	OrderItemType = OrderItemType // Make enum available in template
	faNoteSticky = faNoteSticky
	faCupTogo = faCupTogo
	faUtensils = faUtensils
	faChevronDown = faChevronDown
	faChevronUp = faChevronUp
	@Input() orderItem: OrderItemCard = null
	@Input() selectedOrderItemUuid: string = null
	@Input() selectedOrderItemNote: string = null
	@Input() clickable: boolean = false
	@Output() noteIconClick = new EventEmitter<{
		orderItem: OrderItem
	}>()

	private priceCalculator = new PriceCalculator()

	get isExpanded(): boolean {
		return this.orderItem?.isExpanded ?? false
	}

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

	/**
	 * Checks if the OrderItem should be collapsible
	 */
	isCollapsible(): boolean {
		return (
			this.orderItem.type === OrderItemType.Special ||
			this.orderItem.type === OrderItemType.Menu ||
			this.orderItem.orderItemVariations.length > 0
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
