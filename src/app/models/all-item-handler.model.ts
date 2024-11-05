import { PickedItem } from "./picked-item.model"
import { Variation } from "./variation.model"

export class AllItemHandler {
	private allPickedItems = new Map<number, PickedItem>()

	constructor() {}

	getAllPickedItems() {
		return this.allPickedItems
	}

	//Füge neues Item in die Map hinzu
	pushNewItem(pickedItem: PickedItem) {
		const id = pickedItem.id

		// Prüfen, ob das Item bereits existiert
		if (this.allPickedItems.has(id)) {
			const item = this.allPickedItems.get(id)

			// Anzahl des bestehenden Items erhöhen
			item.anzahl += pickedItem.anzahl

			// Falls Variationen vorhanden sind, diese ebenfalls aktualisieren
			if (pickedItem.pickedVariation) {
				for (const variation of pickedItem.pickedVariation.values()) {
					if (item.pickedVariation.has(variation.id)) {
						// Existierende Variation aktualisieren
						item.pickedVariation.get(variation.id).anzahl +=
							variation.anzahl
					} else {
						// Neue Variation hinzufügen
						item.pickedVariation.set(variation.id, variation)
					}
				}
			}
		} else {
			// Neues Item hinzufügen
			this.allPickedItems.set(id, pickedItem)
		}
	}

	//Übertrage alle Items aus einer anderen Map in diese
	transferAllItems(itemHandler: AllItemHandler) {
		for (let item of itemHandler.getItems()) {
			this.pushNewItem(item)
		}
		itemHandler.getAllPickedItems().clear()
	}

	//Berechne Total Preis von items mit der selben ID
	calculatTotal() {
		let total = 0
		for (let item of this.allPickedItems.values()) {
			if (item.pickedVariation) {
				for (let variation of item.pickedVariation.values()) {
					total += variation.preis * variation.anzahl
				}
			}
			total += item.price * item.anzahl
		}
		return total
	}

	//Gib Liste mit jedem Item zurück
	getItems() {
		return this.allPickedItems.values()
	}

	//Gibt den Gesamtpreis der Variationen zurück
	getTotalVariationPrice(pickedVariation: any): number {
		let total = 0
			for (let variation of pickedVariation.values()) {
				total += variation.preis * variation.anzahl
			}
		
		return total
	}
}
