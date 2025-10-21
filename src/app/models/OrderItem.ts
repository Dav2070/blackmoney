import { Product } from "./Product"
import { Order } from "./Order"
import { OrderItemVariation } from "./OrderItemVariation"
import { Offer } from "./Offer"

export class OrderItem {
	uuid: string
	type: "product" | "menu" | "special"
	count: number
	order: Order
	offer?: Offer
	product: Product
	orderItems?: OrderItem[]
	orderItemVariations?: OrderItemVariation[]
	discount?: number
}
