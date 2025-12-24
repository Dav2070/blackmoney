import { Product } from "./Product"
import { VariationItem } from "./VariationItem"

export interface OfferItem {
	uuid: string
	name: string
	maxSelections: number
	products: Product[]
	selectedVariations?: Map<string, Map<string, VariationItem[]>>
}
