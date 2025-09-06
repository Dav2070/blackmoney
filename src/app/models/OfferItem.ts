import { Product } from "./Product"

export interface OfferItem {
	uuid: string
	name: string
	products: Product[]
	maxSelections: number
}
