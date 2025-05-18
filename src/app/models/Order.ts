import { OrderItem } from "./OrderItem"
import { Table } from "./Table"

export class Order {
	uuid: string
	totalPrice: number
	paidAt: Date
	table: Table
	orderItems: OrderItem[]
}
