import { Component, Input } from "@angular/core"
import { OrderItem } from "src/app/models/OrderItem"
import { calculateTotalPriceOfOrderItem } from "src/app/utils"

@Component({
	selector: "app-order-item-card",
	templateUrl: "./order-item-card.component.html",
	styleUrl: "./order-item-card.component.scss",
	standalone: false
})
export class OrderItemCardComponent {
	calculateTotalPriceOfOrderItem = calculateTotalPriceOfOrderItem
	@Input() orderItem: OrderItem = null
	@Input() selectedOrderItemUuid: string = null
}
