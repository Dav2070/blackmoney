import { ProductType } from "src/app/types"
import { Category } from "./Category"
import { Variation } from "./Variation"
import { Offer } from "./Offer"

export class Product {
	id: number
	uuid: string
	type: ProductType
	name: string
	price: number
	category?: Category
	variations: Variation[]
	offer?: Offer
	takeaway?: boolean
	description?: string
}
