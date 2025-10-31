import { Product } from "./Product"
import { Order } from "./Order"
import { OrderItemVariation } from "./OrderItemVariation"
import { Offer } from "./Offer"
import { OrderItemType } from "../types"

export class OrderItem {
	uuid: string
	type: OrderItemType
	count: number
	order: Order
	offer?: Offer
	product: Product
	orderItems?: OrderItem[]
	orderItemVariations?: OrderItemVariation[]
	note?: string
	discount?: number
	takeAway?: boolean
	course?: number
}
