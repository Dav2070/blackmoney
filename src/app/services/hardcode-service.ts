import { Injectable } from "@angular/core"
import { AllItemHandler } from "../models/cash-register/all-item-handler.model"
import { Bill } from "../models/cash-register/bill.model"

@Injectable({
	providedIn: "root"
})
export class HardcodeService {
	constructor() {}

	/*getItemsofTable(tablenumber: number) {
		let tmpMap = new AllItemHandler()

		tmpMap.pushNewItem({
			uuid: "7",
			price: 4.7,
			name: "Pommes",
			//count: 1,
			pickedVariations: []
		})

		return tmpMap
	}*/

	getBillsOfTable(tablenumber: number) {
		let bills: Bill[] = []

		bills.push(new Bill("Bediener1", 20, null, new Date(), "Bar", false))
		bills.push(new Bill("Bediener1", 21, null, new Date(), "Bar", false))
		return bills
	}
}
