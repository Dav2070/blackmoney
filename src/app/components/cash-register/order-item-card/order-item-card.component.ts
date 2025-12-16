import { Component, EventEmitter, Input, Output } from "@angular/core"
import { OrderItem } from "src/app/models/OrderItem"
import { formatPrice } from "src/app/utils"
import { PriceCalculator } from "src/app/priceUtils"
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

	calculateTotalPriceOfOrderItem(orderItem: OrderItem): number {
		return this.priceCalculator.calculateTotalPrice(orderItem)
	}

	onNoteIconClick(event: Event) {
		event.stopPropagation()
		this.noteIconClick.emit({
			orderItem: this.orderItem
		})
	}
}
