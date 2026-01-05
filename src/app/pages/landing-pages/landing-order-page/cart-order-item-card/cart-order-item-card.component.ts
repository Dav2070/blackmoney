import { Component, EventEmitter, Input, Output } from "@angular/core"
import { OrderItemType } from "src/app/types"
import {
	faNoteSticky,
	faCupTogo,
	faUtensils,
	faPlus,
	faMinus,
	faTrash
} from "@fortawesome/pro-solid-svg-icons"
import { OrderItem } from "src/app/models/OrderItem"
import { OrderItemVariation } from "src/app/models/OrderItemVariation"
import { VariationItem } from "src/app/models/VariationItem"
import { PriceCalculator } from "src/app/models/cash-register/order-item-handling/price-calculator"
import { formatPrice } from "src/app/utils"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-cart-order-item-card",
	templateUrl: "./cart-order-item-card.component.html",
	styleUrl: "./cart-order-item-card.component.scss",
	standalone: false
})
export class CartOrderItemCardComponent {
	locale = this.localizationService.locale.landingOrderPage
	formatPrice = formatPrice
	faNoteSticky = faNoteSticky
	faCupTogo = faCupTogo
	faUtensils = faUtensils
	faPlus = faPlus
	faMinus = faMinus
	faTrash = faTrash
	@Input() orderItem: OrderItem = null
	@Input() selectedOrderItemUuid: string = null
	@Input() selectedOrderItemNote: string = null
	@Input() clickable: boolean = false
	@Output() noteIconClick = new EventEmitter<{
		orderItem: OrderItem
	}>()
	@Output() plusClick = new EventEmitter<OrderItem>()
	@Output() minusClick = new EventEmitter<OrderItem>()
	@Output() addNote = new EventEmitter<OrderItem>()

	private priceCalculator = new PriceCalculator()

	constructor(private localizationService: LocalizationService) {}

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
