import { Component, Input, Output, EventEmitter } from "@angular/core"
import { Variation } from "src/app/models/Variation"
import { VariationItem } from "src/app/models/VariationItem"
import { formatPrice } from "src/app/utils"
import { faEllipsis } from "@fortawesome/pro-regular-svg-icons"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-variation-card",
	templateUrl: "./variation-card.component.html",
	styleUrl: "./variation-card.component.scss",
	standalone: false
})
export class VariationCardComponent {
	locale = this.localizationService.locale.variationCard
	@Input() variation: Variation
	@Output() contextMenuClick = new EventEmitter<{
		event: Event
		variation: Variation
	}>()
	@Output() itemContextMenuClick = new EventEmitter<{
		event: Event
		variation: Variation
		item: VariationItem
	}>()
	@Output() addItemClick = new EventEmitter<Variation>()

	faEllipsis = faEllipsis
	formatPrice = formatPrice

	constructor(private localizationService: LocalizationService) {}

	onContextMenuClick(event: Event) {
		this.contextMenuClick.emit({ event, variation: this.variation })
	}

	onItemContextMenuClick(event: Event, item: VariationItem) {
		this.itemContextMenuClick.emit({
			event,
			variation: this.variation,
			item
		})
	}

	onAddItemClick() {
		this.addItemClick.emit(this.variation)
	}
}
