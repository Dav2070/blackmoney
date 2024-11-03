import { throwServerError } from "@apollo/client"
import { Item } from "./item.model"
import { Variation } from "./variation.model"

export class PickedItem {
	id: number
	price: number
	name: string
	anzahl: number
	pickedVariation?: Variation
	note?: string

	constructor(
		item: Item,
		anzahl: number,
		pickedVariation?: Variation,
		note?: string
	) {
		this.id = item.id
		this.price = item.price
		this.name = item.name
		this.anzahl = anzahl
		this.pickedVariation = pickedVariation
		this.note = note
	}
}
