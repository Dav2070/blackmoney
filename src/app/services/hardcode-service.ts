import { Injectable } from "@angular/core"
import { Item } from "../models/item.model"
import { Variation } from "../models/variation.model"
import { AllItemHandler } from "../models/all-item-handler.model"
import { Bill } from "../models/bill.model"

@Injectable({
	providedIn: "root"
})
export class HardcodeService {
	private tmpMap = new AllItemHandler()
	constructor() {
		this.tmpMap.pushNewItem({
			id: 7,
			price: 4.7,
			name: "Pommes",
			anzahl: 1
		})

		this.tmpMap.pushNewItem({
			id: 6,
			price: 35.7,
			name: "Rinderfilet",
			pickedVariation: new Map<number, Variation>().set(2, {
				id: 2,
				name: "Reis",
				preis: 1,
				anzahl: 2
			}),
			anzahl: 2
		})
	}

	getItemsofTable(tablenumber: number) {
		this.tmpMap.pushNewItem({
			id: 7,
			price: 4.7,
			name: "Pommes",
			anzahl: 1
		})

		this.tmpMap.pushNewItem({
			id: 6,
			price: 35.7,
			name: "Rinderfilet",
			pickedVariation: new Map<number, Variation>().set(2, {
				id: 2,
				name: "Reis",
				preis: 1,
				anzahl: 2
			}),
			anzahl: 2
		})

		return this.tmpMap
	}

	getBillsOfTable(tablenumber: number) {
		let bills: Bill[] = []

		bills.push(
			new Bill("Bediener1", 20, this.tmpMap, new Date(), "Bar", false)
		)
		bills.push(
			new Bill("Bediener1", 21, this.tmpMap, new Date(), "Bar", false)
		)
		return bills
	}
}
