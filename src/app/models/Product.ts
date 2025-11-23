import { ProductType } from "src/app/types"
import { Category } from "./Category"
import { Variation } from "./Variation"

export class Product {
	id: number
	uuid: string
	type: ProductType
	name: string
	price: number
	category: Category
	variations: Variation[]
}
