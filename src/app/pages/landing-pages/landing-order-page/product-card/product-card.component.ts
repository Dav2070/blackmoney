import { Component, Input, Output, EventEmitter } from "@angular/core"
import { Product } from "src/app/models/Product"
import { formatPrice } from "src/app/utils"
import { faPlus } from "@fortawesome/pro-regular-svg-icons"

@Component({
	selector: "app-order-product-card",
	templateUrl: "./product-card.component.html",
	styleUrl: "./product-card.component.scss",
	standalone: false
})
export class OrderProductCardComponent {
	@Input() product: Product
	@Output() addToCart = new EventEmitter<Product>()

	faPlus = faPlus
	formatPrice = formatPrice

	onCardClick() {
		this.addToCart.emit(this.product)
	}

	onAddClick(event: Event) {
		event.stopPropagation()
	}
}
