import { ProductType } from "src/app/types"
import { Category } from "./Category"
import { Variation } from "./Variation"
import { Offer } from "./Offer"

export class Product {
	uuid: string
	type: ProductType
	name: string
	price: number
	shortcut: number
	category?: Category
	variations: Variation[]
	offer?: Offer
	takeaway?: boolean
}
