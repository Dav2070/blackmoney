import { Component, Input } from "@angular/core"
import { OrderItem } from "src/app/models/OrderItem"
import { calculateTotalPriceOfOrderItem } from "src/app/utils"

@Component({
	selector: "app-offer-order-item-card",
	templateUrl: "./offer-order-item-card.component.html",
	styleUrl: "./offer-order-item-card.component.scss",
	standalone: false
})
export class OfferOrderItemCardComponent {
	calculateTotalPriceOfOrderItem = calculateTotalPriceOfOrderItem
	@Input() orderItem: OrderItem = null
	@Input() selectedOrderItemUuid: string = null
}
