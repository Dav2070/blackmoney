import { Product } from "./Product"
import { Order } from "./Order"
import { OrderItemVariation } from "./OrderItemVariation"
import { OrderItem } from "./OrderItem"
import { Menu } from "./Menu"

export class MenuOrderItem {
	uuid: string
	count: number
	order: Order
	menu: Menu
	name: string
	product: Product
	orderItems: OrderItem[]
}
