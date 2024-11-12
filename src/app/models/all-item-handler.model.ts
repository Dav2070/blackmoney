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

	//Entferne Item aus der Map
	deleteItem(pickedItem: any):  void{	
		this.allPickedItems.delete(pickedItem.id)
	}

	deleteVariation(pickedItem: any):  void{	
		this.allPickedItems.get(pickedItem.id).pickedVariation.delete(pickedItem.id)
	}

	getItem(id: number): PickedItem | undefined {
        return this.allPickedItems.get(id)
    }

	 // Prüfen, ob ein bestimmtes Item in der Map enthalten ist
	includes(pickedItem: PickedItem): boolean {
        return this.allPickedItems.has(pickedItem.id)
    }
}
=======
	//Reduziere Item oder Lösche es wenn Item = 0
	reduceItem(item: PickedItem, anzahl: number) {
		if (item.pickedVariation) {
			for (let variation of item.pickedVariation.values()) {
				if (
					this.allPickedItems
						.get(item.id)
						.pickedVariation.get(variation.id).anzahl -
						variation.anzahl ===
					0
				) {
					this.allPickedItems
						.get(item.id)
						.pickedVariation.delete(variation.id)
				} else {
					this.allPickedItems
						.get(item.id)
						.pickedVariation.get(variation.id).anzahl -= 1
				}
			}
			if (this.allPickedItems.get(item.id).anzahl - anzahl === 0) {
				this.allPickedItems.delete(item.id)
			} else {
				this.allPickedItems.get(item.id).anzahl -= anzahl
			}
		} else {
			if (item.anzahl - anzahl === 0) {
				this.allPickedItems.delete(item.id)
			} else {
				item.anzahl -= anzahl
			}
		}
	}
}