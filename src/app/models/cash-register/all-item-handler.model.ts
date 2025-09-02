import { OrderItem } from "src/app/models/OrderItem"
import { Variation } from "src/app/models/Variation"
import { ApiService } from "src/app/services/api-service"
import {
	convertOrderItemResourceToOrderItem,
	convertOrderResourceToOrder
} from "src/app/utils"
import { Order } from "../Order"

export class AllItemHandler {
	private allPickedItems: OrderItem[] = []

	getAllPickedItems() {
		return this.allPickedItems
	}

	// Lade alle Items einer Order
	async loadItemsFromOrder(
		apiService: ApiService,
		tableUuid: string
	): Promise<Order> {
		let order = await apiService.retrieveTable(
			`
				orders(paid: $paid) {
					total
					items {
						uuid
						totalPrice
						bill {
							uuid
						}
						orderItems {
							total
							items {
								uuid
								count
								order {
									uuid
								}
								product {
									id
									uuid
									name
									price
								}
								orderItemVariations {
									total
									items {
										count
										variationItems {
											total
											items {
												id
												uuid
												name
												additionalCost
											}
										}
									}
								}
							}
						}
					}
				}
			`,
			{
				uuid: tableUuid,
				paid: false
			}
		)

		if (order.data.retrieveTable.orders.total > 0) {
			this.clearItems()

			for (const item of order.data.retrieveTable.orders.items[0].orderItems
				.items) {
				this.pushNewItem(convertOrderItemResourceToOrderItem(item))
			}

			return convertOrderResourceToOrder(
				order.data.retrieveTable.orders.items[0]
			)
		}

		return null
	}

	//Füge neues Item in die Map hinzu
	pushNewItem(pickedItem: OrderItem) {
		const id = pickedItem.product.id

		const item = this.allPickedItems.find(item => item.product.id === id)
		// Prüfen, ob das Item bereits existiert
		if (item != undefined) {
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
										item.id === variation.variationItems[index].id &&
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
			this.allPickedItems.push({ ...pickedItem })
		}
	}

	//Füge MenuOrderItem hinzu (für Abwärtskompatibilität - behandelt jetzt alle als OrderItem)
	pushNewMenuItem(pickedItem: OrderItem) {
		this.pushNewItem(pickedItem);
	}

	//Übertrage alle Items aus einer anderen Map in diese
	transferAllItems(itemHandler: AllItemHandler) {
		for (let item of itemHandler.getOrderItems()) {
			this.pushNewItem(item)
		}
		// Neue OrderItem-Struktur behandelt alle Items zusammen
		itemHandler.clearItems()
	}

	//Berechne Total Preis von items mit der selben ID
	calculateTotal() {
		let total = 0

		// Normale Produkte (type: "product")
		const productItems = this.allPickedItems.filter(item => item.type === 'product');
		for (let item of productItems) {
			total += item.product.price * item.count

			if (item.orderItemVariations) {
				for (const variation of item.orderItemVariations) {
					for (const variationItem of variation.variationItems) {
						total += variationItem.additionalCost * variation.count
					}
				}
			}
		}

		// Menu/Special OrderItems (neue Struktur: alles in allPickedItems mit type-Filter)
		const menuItems = this.allPickedItems.filter(item => item.type === 'menu' || item.type === 'special');
		for (let menuItem of menuItems) {
			// Für Menu/Special Items: Berücksichtige den Preis aus dem product.price (aggregiert)
			total += menuItem.product.price;
		}
		return total
	}

	//Gib Liste mit jedem Item zurück (alle OrderItems)
	getItems(): OrderItem[] {
		return this.allPickedItems
	}

	// Nur normale OrderItems (Produkte)
	getOrderItems() {
		return this.allPickedItems.filter(item => item.type === 'product');
	}

	// Nur MenuOrderItems (für Abwärtskompatibilität)
	getMenuOrderItems() {
		return this.allPickedItems.filter(item => item.type === 'menu' || item.type === 'special');
	}

	getItemsCountandId() {
		return this.allPickedItems.map(item => {
			return {
				count: item.count,
				productId: item.product.id,
				orderItemVariations: item.orderItemVariations.map(variation => {
					return {
						count: variation.count,
						variationItems: variation.variationItems.map(
							variationItem => {
								return {
									id: variationItem.id
								}
							}
						)
					}
				})
			}
		})
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

	//Gibt den Preis eines Menu/Special OrderItems zurück
	getTotalMenuPrice(pickedItem: OrderItem): number {
		// Für neue OrderItem-Struktur: Der Preis ist bereits aggregiert im product.price
		return pickedItem.product.price * pickedItem.count;
	}

	//Entferne Item aus der Map
	deleteItem(pickedItem: OrderItem): void {
		const index = this.allPickedItems.findIndex(
			item => item.product.id === pickedItem.product.id
		)
		if (index !== -1) {
			this.allPickedItems.splice(index, 1)
		}
	}

	//Entferne MenuOrderItem aus der Map (für Abwärtskompatibilität)
	deleteMenuItem(pickedItem: OrderItem): void {
		// Neue Struktur: Verwende deleteItem, da alles OrderItems sind
		this.deleteItem(pickedItem);
	}

	deleteVariation(pickedItem: OrderItem): void {
		/*
		this.allPickedItems
			.get(pickedItem.uuid)
			.variations.items.delete(pickedItem.id)
		*/
	}

	getItem(id: number): OrderItem {
		return this.allPickedItems.find(item => item.product.id === id)
	}

	// Gibt ein Menu/Special OrderItem zurück, das dem angegebenen ID entspricht
	getMenuItem(productId: number, menuUuid: string): OrderItem | undefined {
		return this.allPickedItems.find(
			item => (item.type === 'menu' || item.type === 'special') && 
					 item.product.id === productId && 
					 item.menu?.uuid === menuUuid
		)
	}

	// Prüfen, ob ein bestimmtes Item in der Map enthalten ist
	includes(pickedItem: OrderItem): boolean {
		return this.allPickedItems.some(
			item => item.product.id === pickedItem.product.id
		)
	}

	// Prüfen, ob ein bestimmtes Menu/Special Item in der Map enthalten ist
	includesMenuItem(pickedItem: OrderItem): boolean {
		return this.allPickedItems.some(
			item => (item.type === 'menu' || item.type === 'special') && 
					 item.product.id === pickedItem.product.id && 
					 item.menu?.uuid === pickedItem.menu?.uuid
		)
	}

	//Reduziere Item oder Lösche es wenn Item = 0
	reduceItem(item: OrderItem, anzahl: number) {
		item.count -= anzahl
		if (item.count <= 0) {
			this.deleteItem(item)
		}
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

		for (let item of this.allPickedItems) {
			number += item.count
		}

		// Neue Struktur: Alle Items sind bereits in allPickedItems enthalten
		return number
	}

	//Entfernt alle Items aus Map
	clearItems() {
		this.allPickedItems = []
	}

	isEmpty() {
		return this.allPickedItems.length === 0
	}
}
