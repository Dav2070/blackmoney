import { Injectable } from "@angular/core"
import { Item } from "../models/item.model"
import { Variation } from "../models/variation.model"
import { AllItemHandler } from "../models/all-item-handler.model"

@Injectable({
	providedIn: "root"
})
export class HardcodeService {
	constructor() {}

	getItemsofTable(tablenumber: number) {
		var tmpMap = new AllItemHandler()
		tmpMap.pushNewItem({
			id: 7,
			price: 4.7,
			name: "Pommes",
			anzahl: 1
		})

		tmpMap.pushNewItem({
			id: 6,
			price: 35.7,
			name: "Rinderfilet",
			pickedVariation: { id: 2, name: "Reis", preis: 1 },
			anzahl: 1
		})

		return tmpMap
	}
}
