import { OrderItemResource, ProductResource, VariationResource } from "../../types"

export class AllItemHandler {
	private allPickedItems = new Map<string, OrderItemResource>()

	getAllPickedItems() {
		return this.allPickedItems
	}

	//Füge neues Item in die Map hinzu
	pushNewItem(pickedItem: OrderItemResource) {
		const uuid = pickedItem.uuid
	
		// Prüfen, ob das Item bereits existiert
		if (this.allPickedItems.has(uuid)) {
			const item = this.allPickedItems.get(uuid)
	
			// Anzahl des bestehenden Items erhöhen
			item.count += pickedItem.count
	
			// Falls Variationen vorhanden sind, diese ebenfalls aktualisieren
			if (pickedItem.pickedVariations) {
				for (const variation of pickedItem.pickedVariations) {
					let existingVariation = item.pickedVariations.find(
						v => v.variations[0].uuid == variation.variations[0].uuid
					)
	
					if (existingVariation != null) {
						// Existierende Variation aktualisieren
						for (const variationItem of variation.variations) {
							let existingVariationItem = existingVariation.variations.find(
								vi => vi.uuid == variationItem.uuid
							)
							if (existingVariationItem != null) {
								//existingVariationItem.count += variationItem.count
							} else {
								// Neues VariationItem hinzufügen
								existingVariation.variations.push(variationItem)
							}
						}
					} else {
						// Neue Variation hinzufügen
						item.pickedVariations.push(variation)
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
	getTotalVariationPrice(pickedVariation: VariationResource[]): number {
		let total = 0

		for (let variation of pickedVariation) {
			for (let variationItem of variation.variationItems.items) {
				//total += variationItem.price * variationItem.count
			}
		}

		return total
	}

	//Entferne Item aus der Map
	deleteItem(pickedItem: OrderItemResource): void {
		this.allPickedItems.delete(pickedItem.uuid)
	}

	deleteVariation(pickedItem: OrderItemResource): void {
		/*
		this.allPickedItems
			.get(pickedItem.uuid)
			.variations.items.delete(pickedItem.id)
		*/
	}

	getItem(uuid: string): OrderItemResource {
		return this.allPickedItems.get(uuid)
	}

	// Prüfen, ob ein bestimmtes Item in der Map enthalten ist
	includes(pickedItem: OrderItemResource): boolean {
		return this.allPickedItems.has(pickedItem.uuid)
	}

	//Reduziere Item oder Lösche es wenn Item = 0
	reduceItem(item: OrderItemResource, anzahl: number) {
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
