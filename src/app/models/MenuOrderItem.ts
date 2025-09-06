import { Product } from "./Product"
import { Order } from "./Order"
import { OrderItem } from "./OrderItem"
import { Menu } from "./Menu"

export class MenuOrderItem {
	uuid: string
	count: number
	order: Order
	menu: Menu
	product: Product
	orderItems: OrderItem[]
}
