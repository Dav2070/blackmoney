import { Injectable } from "@angular/core"
import { AllItemHandler } from "../models/cash-register/all-item-handler.model"
import { Bill } from "../models/cash-register/bill.model"

@Injectable({
	providedIn: "root"
})
export class HardcodeService {
	constructor() {}

	getItemsofTable(tablenumber: number) {
		let tmpMap = new AllItemHandler()

		tmpMap.pushNewItem({
			uuid: "7",
			price: 4.7,
			name: "Pommes",
			count: 1,
			variations: null
		})

		tmpMap.pushNewItem({
			uuid: "6",
			count: 2,
			price: 35.7,
			name: "Rinderfilet",
			variations: {
				total: 0,
				items: [
					{
						uuid: "2",
						name: "Reis",
						price: 1,
						count: 2
					}
				]
			}
		})

		return tmpMap
	}

	getBillsOfTable(tablenumber: number) {
		let bills: Bill[] = []

		bills.push(
			new Bill(
				"Bediener1",
				20,
				this.getItemsofTable(tablenumber),
				new Date(),
				"Bar",
				false
			)
		)
		bills.push(
			new Bill(
				"Bediener1",
				21,
				this.getItemsofTable(tablenumber),
				new Date(),
				"Bar",
				false
			)
		)
		return bills
	}
}
