import { Component, Input } from "@angular/core"
import { OfferOrderItem } from "src/app/models/OfferOrderItem"
import { calculateTotalPriceOfOfferOrderItem } from "src/app/utils"

@Component({
	selector: "app-offer-order-item-card",
	templateUrl: "./offer-order-item-card.component.html",
	styleUrl: "./offer-order-item-card.component.scss",
	standalone: false
})
export class OfferOrderItemCardComponent {
	calculateTotalPriceOfOfferOrderItem = calculateTotalPriceOfOfferOrderItem
	@Input() offerOrderItem: OfferOrderItem = null
	@Input() selectedOfferOrderItemUuid: string = null
}
