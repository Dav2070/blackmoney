import { Product } from "./Product"

export interface OfferItem {
	uuid: string
	name: string
	maxSelections: number
	products: Product[]
}
