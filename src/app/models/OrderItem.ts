import { Product } from "./Product"
import { Order } from "./Order"
import { OrderItemVariation } from "./OrderItemVariation"
import { Menu } from "./Menu"

export class OrderItem {
	uuid: string
	type: "product" | "menu" | "special"
	count: number
	order: Order
	product: Product
	menu?: Menu
	name?: string
	orderItems?: OrderItem[]
	orderItemVariations?: OrderItemVariation[]
}
