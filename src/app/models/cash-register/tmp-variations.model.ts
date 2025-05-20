import { VariationItem } from "../VariationItem"

export class TmpVariations {
	uuid: string
	count: number
	max: number
	lastPickedVariation: VariationItem[]
	pickedVariation: VariationItem[]
	display: string
	combination: string
}
