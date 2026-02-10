import { Component, Input, Output, EventEmitter } from "@angular/core"
import { faList } from "@fortawesome/pro-regular-svg-icons"
import { Menu } from "src/app/models/Menu"
import { Product } from "src/app/models/Product"
import { Variation } from "src/app/models/Variation"
import { Offer } from "src/app/models/Offer"
import { formatPrice } from "src/app/utils"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-restaurant-menu",
	templateUrl: "./restaurant-menu.component.html",
	styleUrls: ["./restaurant-menu.component.scss"],
	standalone: false
})
export class RestaurantMenuComponent {
	@Input() topProducts: Product[] = []
	@Input() bestsellers: Menu | null = null

	@Output() openMenuDialogClick = new EventEmitter<void>()

	faList = faList
	formatPrice = formatPrice

	locale = this.localizationService.locale.restaurantInfoPage

	constructor(private localizationService: LocalizationService) {}

	openMenuDialog() {
		this.openMenuDialogClick.emit()
	}

	getVariationTooltip(variation: Variation): string {
		if (!variation.variationItems || variation.variationItems.length === 0) {
			return variation.name
		}

		const items = variation.variationItems
			.map(item => {
				const cost =
					item.additionalCost > 0
						? ` (+${formatPrice(item.additionalCost)})`
						: ""
				return `${item.name}${cost}`
			})
			.join(", ")

		return `${variation.name}: ${items}`
	}

	getOffersOfMenu(menu: Menu): Offer[] {
		if (menu == null) return []
		const offers: Offer[] = []

		for (const category of menu.categories) {
			for (const product of category.products) {
				if (product.offer) {
					offers.push(product.offer)
				}
			}
		}

		return offers
	}
}
