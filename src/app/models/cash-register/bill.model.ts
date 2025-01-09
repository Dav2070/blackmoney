import { AllItemHandler } from "./all-item-handler.model"

export class Bill {
	operator: string
	table: number
	items: AllItemHandler
	time: Date
	payment: string
	seperate: boolean

	constructor(
		operator: string,
		table: number,
		items: AllItemHandler,
		time: Date,
		payment: string,
		seperate: boolean
	) {
		this.operator = operator
		this.table = table
		this.items = items
		this.time = time
		this.payment = payment
		this.seperate = seperate
	}
}
