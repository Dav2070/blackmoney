import { OrderItem } from "src/app/models/OrderItem"
import { OfferOrderItem } from "src/app/models/OfferOrderItem"
import { Variation } from "src/app/models/Variation"
import { ApiService } from "src/app/services/api-service"
import {
	convertOrderItemResourceToOrderItem,
	convertOrderResourceToOrder
} from "src/app/utils"
import { Order } from "../Order"

export class AllItemHandler {
	private allPickedItems: OrderItem[] = []
	private allPickedOfferItems: OfferOrderItem[] = []

	getAllPickedItems() {
		return this.allPickedItems
	}

	getAllPickedOfferItems() {
		return this.allPickedOfferItems
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

		const item = this.allPickedItems.find(item => 
			item.product.id === id && item.uuid === pickedItem.uuid
		)

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

	//Füge OfferOrderItem hinzu
	pushNewOfferItem(pickedItem: OfferOrderItem) {
		this.allPickedOfferItems.push({ ...pickedItem })
	}

	//Übertrage alle Items aus einer anderen Map in diese
	transferAllItems(itemHandler: AllItemHandler) {
		for (let item of itemHandler.getOrderItems()) {
			this.pushNewItem(item)
		}
		for (let offerItem of itemHandler.getOfferOrderItems()) {
			this.pushNewOfferItem(offerItem)
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

		// MenuOrderItems
		for (let menuItem of this.allPickedOfferItems) {
			for (let item of menuItem.orderItems) {
				total += item.product.price * item.count

				if (item.orderItemVariations) {
					for (const variation of item.orderItemVariations) {
						for (const variationItem of variation.variationItems) {
							total += variationItem.additionalCost * variation.count
						}
					}
				}
			}
		}
		return total
	}

	//Gib Liste mit jedem Item zurück (normale + Offer Items)
	getItems(): (OrderItem | OfferOrderItem)[] {
		return [...this.allPickedItems, ...this.allPickedOfferItems]
	}

	// Nur normale OrderItems
	getOrderItems() {
		return this.allPickedItems
	}

	// Nur OfferOrderItems
	getOfferOrderItems() {
		return this.allPickedOfferItems
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

	//Gibt den Preis eines OfferOrderItems aus dem jeweiligen Handler zurück
	getTotalMenuPrice(pickedItem: OfferOrderItem): number {
		let total = 0

		for (let item of pickedItem.orderItems) {
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

	//Entferne Item aus der Map
	deleteItem(pickedItem: OrderItem): void {
		const index = this.allPickedItems.findIndex(
			item => item.product.id === pickedItem.product.id
		)
		if (index !== -1) {
			this.allPickedItems.splice(index, 1)
		}
	}

	//Entferne OfferOrderItem aus der Map
	deleteOfferItem(pickedItem: OfferOrderItem): void {
		const index = this.allPickedOfferItems.findIndex(
			item =>
				item.product.id === pickedItem.product.id &&
				item.offer.uuid === pickedItem.offer.uuid
		)
		if (index !== -1) {
			this.allPickedOfferItems.splice(index, 1)
		}
	}

	deleteVariation(pickedItem: OrderItem): void {
		/*
		this.allPickedItems
			.get(pickedItem.uuid)
			.variations.items.delete(pickedItem.id)
		*/
	}

	getItem(id: number, uuid?: string): OrderItem {
		if (uuid) {
			return this.allPickedItems.find(item => item.product.id === id && item.uuid === uuid)
		}
		return this.allPickedItems.find(item => item.product.id === id)
	}

	// Gibt ein OfferOrderItem zurück, das dem angegebenen ID entspricht
	getOfferItem(productId: number, offerUuid: string): OfferOrderItem {
		return this.allPickedOfferItems.find(
			item => item.product.id === productId && item.offer.uuid === offerUuid
		)
	}

	// Prüfen, ob ein bestimmtes Item in der Map enthalten ist
	includes(pickedItem: OrderItem): boolean {
		return this.allPickedItems.some(
			item => item.product.id === pickedItem.product.id && item.uuid === pickedItem.uuid
		)
	}

	// Prüfen, ob ein bestimmtes OfferOrderItem in der Map enthalten ist, prüft auf die id des Produkts UND des Angebots
	includesOfferItem(pickedItem: OfferOrderItem): boolean {
		return this.allPickedOfferItems.some(
			item =>
				item.product.id === pickedItem.product.id &&
				item.offer.uuid === pickedItem.offer.uuid
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

		for (let offerItem of this.allPickedOfferItems) {
			number += offerItem.count
		}

		return number
	}

	//Entfernt alle Items aus Map
	clearItems() {
		this.allPickedItems = []
		this.allPickedOfferItems = []
	}

	isEmpty() {
		return (
			this.allPickedItems.length === 0 &&
			this.allPickedOfferItems.length === 0
		)
	}
}
