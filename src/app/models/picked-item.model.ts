import { Variation } from "./variation.model"

export class PickedItem {
	id: number
	price: number
	name: string
	pickedVariation?: Variation
	note?: string
}
