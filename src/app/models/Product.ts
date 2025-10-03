import { Category } from "./Category"
import { Variation } from "./Variation"

export class Product {
	id: number
	uuid: string
	name: string
	price: number
	category?: Category
	variations: Variation[]
	takeaway?: boolean
}
