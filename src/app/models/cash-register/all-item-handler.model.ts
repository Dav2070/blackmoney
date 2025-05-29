import { OrderItem } from "src/app/models/OrderItem"
import { Variation } from "src/app/models/Variation"
import { ApiService } from "src/app/services/api-service"
import {
	convertOrderItemResourceToOrderItem,
	convertOrderResourceToOrder
} from "src/app/utils"
import { Order } from "../Order"

export class AllItemHandler {
	//private allPickedItems = new Map<string, OrderItem>()
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

	//Übertrage alle Items aus einer anderen Map in diese
	transferAllItems(itemHandler: AllItemHandler) {
		for (let item of itemHandler.getItems()) {
			this.pushNewItem(item)
		}

		itemHandler.clearItems()
	}

	//Berechne Total Preis von items mit der selben ID
	calculateTotal() {
		let total = 0

		for (let item of this.allPickedItems) {
			total += item.product.price * item.count

			if (item.orderItemVariations) {
				for (const variation of item.orderItemVariations) {
					for (const variationItem of variation.variationItems) {
						total += variationItem.additionalCost * variation.count
					}
				}
			}
		}

		return total
	}

	//Gib Liste mit jedem Item zurück
	getItems() {
		return this.allPickedItems
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

	//Entferne Item aus der Map
	deleteItem(pickedItem: OrderItem): void {
		//this.allPickedItems.delete(pickedItem.uuid)
		const index = this.allPickedItems.findIndex(
			item => item.product.id === pickedItem.product.id
		)
		if (index !== -1) {
			this.allPickedItems.splice(index, 1)
		}
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

	// Prüfen, ob ein bestimmtes Item in der Map enthalten ist
	includes(pickedItem: OrderItem): boolean {
		return this.allPickedItems.some(
			item => item.product.id === pickedItem.product.id
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

		for (let item of this.allPickedItems.values()) {
			number += item.count
		}

		return number
	}

	//Entfertn alle Items aus Map
	clearItems() {
		this.allPickedItems = []
		//this.allPickedItems.clear()
	}

	isEmpty() {
		return this.allPickedItems.length === 0
	}
}
