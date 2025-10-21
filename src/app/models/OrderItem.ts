import { Product } from "./Product"
import { Order } from "./Order"
import { OrderItemVariation } from "./OrderItemVariation"

export class OrderItem {
	uuid: string
	count: number
	order: Order
	product: Product
	orderItemVariations: OrderItemVariation[]
	note?: string
}
