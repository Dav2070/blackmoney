import { Component, EventEmitter, Input, Output } from "@angular/core"
import { OrderItem } from "src/app/models/OrderItem"
import { calculateTotalPriceOfOrderItem } from "src/app/utils"
import { faNoteSticky } from "@fortawesome/pro-solid-svg-icons"

@Component({
	selector: "app-order-item-card",
	templateUrl: "./order-item-card.component.html",
	styleUrl: "./order-item-card.component.scss",
	standalone: false
})
export class OrderItemCardComponent {
	calculateTotalPriceOfOrderItem = calculateTotalPriceOfOrderItem
	faNoteSticky = faNoteSticky
	@Input() orderItem: OrderItem = null
	@Input() selectedOrderItemUuid: string = null
	@Input() selectedOrderItemNote: string = null
	@Output() noteIconClick = new EventEmitter<{
		orderItem: OrderItem
	}>()

	onNoteIconClick(event: Event) {
		event.stopPropagation()
		this.noteIconClick.emit({
			orderItem: this.orderItem
		})
	}
}
