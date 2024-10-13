import { Injectable } from "@angular/core"
import { Item } from "../models/item.model"
import { Variation } from "../models/variation.model"

@Injectable({
	providedIn: "root"
})
export class HardcodeService {
	constructor() {}

	getItemsofTable(tablenumber: number) {
		var tmpMap = new Map<Item, Map<Variation, number>>()
		tmpMap.set(
			{
				id: 7,
				price: 4.7,
				name: "Pommes",
				variations: [],
				pickedVariation: { name: null, preis: null }
			},
			new Map<Variation, number>([[{ name: null, preis: null }, 4]])
		)

		tmpMap.set(
			{
				id: 6,
				price: 35.7,
				name: "Rinderfilet",
				variations: [
					{ name: "Pommes", preis: 0 },
					{ name: "Reis", preis: 1 },
					{ name: "Kroketten", preis: 1.5 }
				],
				pickedVariation: { name: null, preis: null }
			},
			new Map<Variation, number>([
				[{ name: "Pommes", preis: 0 }, 4],
				[{ name: "Reis", preis: 1 }, 3],
				[{ name: "Kroketten", preis: 1.5 }, 1]
			])
		)

		return tmpMap
	}
}
