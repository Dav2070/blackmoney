import { Product } from "./Product"
import { Order } from "./Order"
import { OrderItem } from "./OrderItem"
import { Offer } from "./Offer"

export class OfferOrderItem {
	uuid: string
	count: number
	order: Order
	offer: Offer
	product: Product
	orderItems: OrderItem[]
}
