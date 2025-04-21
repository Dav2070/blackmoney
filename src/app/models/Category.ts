import { CategoryType } from "../types"
import { Product } from "./Product"

export class Category {
	uuid: string
	name: string
	type: CategoryType
	products: Product[]
}
