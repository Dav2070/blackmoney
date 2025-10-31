import { Component, EventEmitter, Input, Output } from "@angular/core"
import { OrderItem } from "src/app/models/OrderItem"
import { calculateTotalPriceOfOrderItem } from "src/app/utils"
import {
	faNoteSticky,
	faCupTogo,
	faUtensils
} from "@fortawesome/pro-solid-svg-icons"

@Component({
	selector: "app-offer-order-item-card",
	templateUrl: "./offer-order-item-card.component.html",
	styleUrl: "./offer-order-item-card.component.scss",
	standalone: false
})
export class OfferOrderItemCardComponent {
	calculateTotalPriceOfOrderItem = calculateTotalPriceOfOrderItem
	faNoteSticky = faNoteSticky
	faCupTogo = faCupTogo
	faUtensils = faUtensils
	@Input() orderItem: OrderItem = null
	@Input() selectedOrderItemUuid: string = null
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
