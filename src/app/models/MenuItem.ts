import { Product } from "./Product"

export interface MenuItem {
	uuid: string
	name: string
	products: Product[]
	maxSelections: number
}
