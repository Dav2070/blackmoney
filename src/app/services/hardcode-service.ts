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
				name: "Pommes"
			},
			new Map<Variation, number>([
				[{ id: null, name: null, preis: null }, 4]
			])
		)

		tmpMap.set(
			{
				id: 6,
				price: 35.7,
				name: "Rinderfilet",
				variations: [
					{ id: 1, name: "Pommes", preis: 0 },
					{ id: 2, name: "Reis", preis: 1 },
					{ id: 3, name: "Kroketten", preis: 1.5 }
				]
			},
			new Map<Variation, number>([
				[{ id: 1, name: "Pommes", preis: 0 }, 4],
				[{ id: 2, name: "Reis", preis: 1 }, 3],
				[{ id: 3, name: "Kroketten", preis: 1.5 }, 1]
			])
		)

		return tmpMap
	}
}
