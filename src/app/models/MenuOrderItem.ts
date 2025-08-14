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
	product: Product // Das virtuelle Product das das Special repräsentiert
	orderItems: OrderItem[] // Die ausgewählten Produkte des Specials mit ihren Variationen
}
