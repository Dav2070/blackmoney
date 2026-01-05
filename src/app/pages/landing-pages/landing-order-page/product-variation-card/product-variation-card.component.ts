import { Component, Input, Output, EventEmitter } from "@angular/core"
import { Product } from "src/app/models/Product"
import { formatPrice } from "src/app/utils"
import { faPlus, faList } from "@fortawesome/pro-regular-svg-icons"

@Component({
	selector: "app-order-product-variation-card",
	templateUrl: "./product-variation-card.component.html",
	styleUrl: "./product-variation-card.component.scss",
	standalone: false
})
export class OrderProductVariationCardComponent {
	@Input() product: Product
	@Output() selectProduct = new EventEmitter<Product>()

	faPlus = faPlus
	faList = faList
	formatPrice = formatPrice

	onCardClick() {
		console.log("Variation card clicked, emitting:", this.product)
		this.selectProduct.emit(this.product)
	}

	onAddClick(event: Event) {
		console.log("Variation add clicked, emitting:", this.product)
		event.stopPropagation()
		this.selectProduct.emit(this.product)
	}

	getVariationNames(): string {
		if (!this.product.variations || this.product.variations.length === 0) {
			return ""
		}
		return this.product.variations.map(v => v.name).join(", ")
	}

	getVariationTooltip(variation: any): string {
		if (!variation.variationItems || variation.variationItems.length === 0) {
			return variation.name
		}

		const items = variation.variationItems
			.map((item: any) => {
				const cost =
					item.additionalCost > 0
						? ` (+${formatPrice(item.additionalCost)})`
						: ""
				return `${item.name}${cost}`
			})
			.join(", ")

		return `${variation.name}: ${items}`
	}

	getVariationsTooltip(): string {
		if (!this.product.variations || this.product.variations.length === 0) {
			return ""
		}
		return this.product.variations
			.map(variation => {
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
			})
			.join("\n")
	}
}
