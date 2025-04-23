import e from "express"
import { OrderItem } from "src/app/models/OrderItem"
import { Variation } from "src/app/models/Variation"

export class AllItemHandler {
	private allPickedItems = new Map<string, OrderItem>()

	getAllPickedItems() {
		return this.allPickedItems
	}

	//Füge neues Item in die Map hinzu
	pushNewItem(pickedItem: OrderItem) {
		const uuid = pickedItem.uuid

		// Prüfen, ob das Item bereits existiert
		if (this.allPickedItems.has(uuid)) {
			const item = this.allPickedItems.get(uuid)

			// Anzahl des bestehenden Items erhöhen
			item.count += pickedItem.count

			// Falls Variationen vorhanden sind, diese ebenfalls aktualisieren
			if (pickedItem.orderItemVariations) {
				for (const variation of pickedItem.orderItemVariations) {
					let existingVariation = null

					if (item.orderItemVariations) {
						existingVariation = item.orderItemVariations.find(
							v =>
								v.variationItems.length ===
									variation.variationItems.length &&
								v.variationItems.every(
									(item, index) =>
										item.name ===
											variation.variationItems[index].name &&
										item.uuid === variation.variationItems[index].uuid
								)
						)
					}

					if (existingVariation != null) {
						// Existierende Variation aktualisieren
						existingVariation.count += variation.count
					} else {
						// Neue Variation hinzufügen
						item.orderItemVariations.push(variation)
					}
				}
			}
		} else {
			// Neues Item hinzufügen
			this.allPickedItems.set(uuid, { ...pickedItem })
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
	calculateTotal() {
		let total = 0

		/*for (let item of this.allPickedItems.values()) {
			if (item.variations != null) {
				for (let variation of item.variations.items) {
					for (let variationItem of variation.variationItems.items) {
						//total += variationItem.price * variationItem.count
					}
				}
			}

			//total += item.price * item.count
		}*/

		return total
	}

	//Gib Liste mit jedem Item zurück
	getItems() {
		return this.allPickedItems.values()
	}

	//Gibt den Gesamtpreis der Variationen zurück
	getTotalVariationPrice(pickedVariation: Variation[]): number {
		let total = 0

		for (let variation of pickedVariation) {
			for (let variationItem of variation.variationItems) {
				//total += variationItem.price * variationItem.count
			}
		}

		return total
	}

	//Entferne Item aus der Map
	deleteItem(pickedItem: OrderItem): void {
		this.allPickedItems.delete(pickedItem.uuid)
	}

	deleteVariation(pickedItem: OrderItem): void {
		/*
		this.allPickedItems
			.get(pickedItem.uuid)
			.variations.items.delete(pickedItem.id)
		*/
	}

	getItem(uuid: string): OrderItem {
		return this.allPickedItems.get(uuid)
	}

	// Prüfen, ob ein bestimmtes Item in der Map enthalten ist
	includes(pickedItem: OrderItem): boolean {
		return this.allPickedItems.has(pickedItem.uuid)
	}

	//Reduziere Item oder Lösche es wenn Item = 0
	reduceItem(item: OrderItem, anzahl: number) {
		// if (item.variations != null) {
		// 	for (let variation of item.variations.items) {
		// 		if (
		// 			this.allPickedItems
		// 				.get(item.uuid)
		// 				.variations.items.find(v => variation.uuid)?.count -
		// 				variation.count ===
		// 			0
		// 		) {
		// 			this.allPickedItems
		// 				.get(item.id)
		// 				.pickedVariation.delete(variation.id)
		// 		} else {
		// 			this.allPickedItems
		// 				.get(item.id)
		// 				.pickedVariation.get(variation.id).anzahl -= 1
		// 		}
		// 	}
		// 	if (this.allPickedItems.get(item.id).anzahl - anzahl === 0) {
		// 		this.allPickedItems.delete(item.id)
		// 	} else {
		// 		this.allPickedItems.get(item.id).anzahl -= anzahl
		// 	}
		// } else {
		// 	if (item.anzahl - anzahl === 0) {
		// 		this.allPickedItems.delete(item.id)
		// 	} else {
		// 		item.anzahl -= anzahl
		// 	}
		// }
	}

	//Gibt die Anzahl von allen Items zurück
	getNumberOfItems() {
		let number = 0

		for (let item of this.allPickedItems.values()) {
			//number += item.count
		}

		return number
	}

	//Entfertn alle Items aus Map
	clearItems() {
		this.allPickedItems.clear()
	}

	isEmpty() {
		return this.allPickedItems.size == 0
	}
}
