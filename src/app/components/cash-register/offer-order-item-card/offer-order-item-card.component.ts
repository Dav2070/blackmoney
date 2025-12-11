import { Component, EventEmitter, Input, Output } from "@angular/core"
import {
	faNoteSticky,
	faCupTogo,
	faUtensils
} from "@fortawesome/pro-solid-svg-icons"
import { OrderItem } from "src/app/models/OrderItem"
import { LocalizationService } from "src/app/services/localization-service"
import {
	calculateUnitPriceOfOrderItem,
	calculateTotalPriceOfOrderItem,
	formatPrice
} from "src/app/utils"

@Component({
	selector: "app-offer-order-item-card",
	templateUrl: "./offer-order-item-card.component.html",
	styleUrl: "./offer-order-item-card.component.scss",
	standalone: false
})
export class OfferOrderItemCardComponent {
	locale = this.localizationService.locale.offerOrderItemCard
	calculateUnitPriceOfOrderItem = calculateUnitPriceOfOrderItem
	calculateTotalPriceOfOrderItem = calculateTotalPriceOfOrderItem
	formatPrice = formatPrice
	faNoteSticky = faNoteSticky
	faCupTogo = faCupTogo
	faUtensils = faUtensils
	@Input() orderItem: OrderItem = null
	@Input() selectedOrderItemUuid: string = null
	@Input() clickable: boolean = false
	@Output() noteIconClick = new EventEmitter<{
		orderItem: OrderItem
	}>()

	constructor(private localizationService: LocalizationService) {}

	onNoteIconClick(event: Event) {
		event.stopPropagation()
		this.noteIconClick.emit({
			orderItem: this.orderItem
		})
	}
}
