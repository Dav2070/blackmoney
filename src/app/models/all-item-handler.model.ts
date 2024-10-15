import { PickedItem } from "./picked-item.model"

export class AllItemHandler {
	private allPickedItems = new Map<number, PickedItem[]>()

	constructor() {}

	getAllPickedItems() {
		return this.allPickedItems
	}

	//Füge neues Item in die Map hinzu
	pushNewItem(pickedItem: PickedItem) {
		let id = pickedItem.id
		if (this.allPickedItems.has(id)) {
			this.allPickedItems.get(id).push(pickedItem)
		} else {
			this.allPickedItems.set(id, [pickedItem])
		}
	}

	//Übertrage alle Items aus einer anderen Map in diese
	transferAllItems(itemHandler: AllItemHandler) {
		for (let items of itemHandler.getAllPickedItems().values()) {
			for (let item of items) {
				this.pushNewItem(item)
			}
		}
		itemHandler.getAllPickedItems().clear()
	}

	//Berechne Total Preis von items mit der selben ID
	calculatTotal() {
		let total = 0
		for (let items of this.allPickedItems.values()) {
			for (let item of items) {
				total += item.price
			}
		}
		return total
	}
}
