import { Bill } from "./Bill"
import { OrderItem } from "./OrderItem"
import { Table } from "./Table"

export class Order {
	uuid: string
	totalPrice: number
	paymentMethod: string
	paidAt: Date
	bill: Bill
	table: Table
	orderItems: OrderItem[]
}
