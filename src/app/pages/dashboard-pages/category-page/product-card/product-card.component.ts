import { Component, EventEmitter, Input, Output } from "@angular/core"
import { faEllipsis } from "@fortawesome/pro-regular-svg-icons"
import { Product } from "src/app/models/Product"
import { formatPrice } from "src/app/utils"

@Component({
	selector: "app-product-card",
	templateUrl: "./product-card.component.html",
	styleUrl: "./product-card.component.scss",
	standalone: false
})
export class ProductCardComponent {
	faEllipsis = faEllipsis
	formatPrice = formatPrice
	@Input() product: Product = null
	@Output() optionsButtonClick = new EventEmitter()
}
