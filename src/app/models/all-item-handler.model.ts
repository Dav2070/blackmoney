import { PickedItem } from "./picked-item.model"
import { Variation } from "./variation.model"

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
				if (item.pickedVariation) {
					for (let variation of item.pickedVariation) {
						total += variation.preis * variation.anzahl
					}
				}
				total += item.price * item.anzahl
			}
		}
		return total
	}

	//Gib Liste mit jedem Item zurück
	getItems() {
		let displayedItems: PickedItem[] = []
		for (let item of this.allPickedItems.values()) {
			displayedItems.push(item[0])
		}
		return displayedItems
	}

	//Berechne wie viele Items es von einem gewählten Item gibt
	calculateNumberOfItems(id: number) {
		let number = 0
		let items = this.allPickedItems.get(id)
		for (let item of items) {
			number += item.anzahl
		}
		return number
	}

	//Berechne Preis einem Item in der Liste
	calculatePriceofItem(id: number) {
		let total = 0
		let items = this.allPickedItems.get(id)
		for (let item of items) {
			if (item.pickedVariation) {
				for (let variation of item.pickedVariation) {
					total += variation.preis * variation.anzahl
				}
			}
			total += item.price * item.anzahl
		}
		return total
	}

	//Gibt alle Variationen zurück
	getVariations(id: number) {
		let displayVariations: Variation[] = []
		let items = this.allPickedItems.get(id)
		for (let item of items) {
			for (let variation of item.pickedVariation) {
				if (
					this.checkIfVariationIsNotIncluded(variation, displayVariations)
				) {
					displayVariations.push(variation)
				}
			}
		}
		return displayVariations
	}

	//Checkt ob Variation in der Liste vorhanden ist
	checkIfVariationIsNotIncluded(
		pickedVariation: Variation,
		displayVariations: Variation[]
	) {
		for (let variation of displayVariations) {
			if (variation.id === pickedVariation.id) {
				return false
			}
		}
		return true
	}

	//Gibt die Anzahl einer Variation zurück
	getNumberOfVariation(variationId: number, itemId: number) {
		let number = 0
		let items = this.allPickedItems.get(itemId)
		for (let item of items) {
			for (let variation of item.pickedVariation) {
				if (variation.id === variationId) {
					number += variation.anzahl
				}
			}
		}
		return number
	}

	//Gibt die Anzahl einer Variation zurück
	getPriceOfVariation(variationId: number, itemId: number) {
		let total = 0
		let items = this.allPickedItems.get(itemId)
		for (let item of items) {
			for (let variation of item.pickedVariation) {
				if (variation.id === variationId) {
					total += variation.preis * variation.anzahl
				}
			}
		}
		return total
	}
}
