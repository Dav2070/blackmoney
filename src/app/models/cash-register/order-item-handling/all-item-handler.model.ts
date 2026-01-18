import { OrderItem } from "src/app/models/OrderItem"
import { OrderItemVariation } from "src/app/models/OrderItemVariation"
import { ApiService } from "src/app/services/api-service"
import {
	convertOrderItemResourceToOrderItem,
	convertOrderResourceToOrder
} from "src/app/utils"
import { PriceCalculator } from "src/app/models/cash-register/order-item-handling/price-calculator"
import { Order } from "../../Order"
import { OrderItemMerger } from "./order-item-merger"
import { VariationComparer } from "./variation-comparer"

export class AllItemHandler {
	private allPickedItems: OrderItem[] = []
	private readonly merger: OrderItemMerger
	private readonly priceCalculator = new PriceCalculator()
	variationComparer = new VariationComparer()

	constructor() {
		this.merger = new OrderItemMerger(this.allPickedItems)
	}

	getAllPickedItems() {
		return this.allPickedItems
	}

	// Setzt Items direkt ohne Merging-Logik (für Backend-Responses, die bereits korrekt gemerged sind)
	setItems(items: OrderItem[]) {
		this.allPickedItems = items
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
								type
								discount
								diversePrice
								notes
								takeAway
								course
								order {
									uuid
								}
								product {
									uuid
									type
									name
									price
									shortcut
									variations {
										total
										items {
											uuid
											name
											variationItems {
												total
												items {
													uuid
													name
													additionalCost
												}
											}
										}
									}
								}
								offer {
									id
									uuid
									offerType
									discountType
									offerValue
									startDate
									endDate
									startTime
									endTime
									weekdays
								}
								orderItemVariations {
									total
									items {
										uuid
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
								orderItems {
									items {
										uuid
										count
										type
										discount
										diversePrice
										notes
										takeAway
										course
										product {
											uuid
											name
											type
											price
											shortcut
											variations {
												total
												items {
													uuid
													name
													variationItems {
														total
														items {
															uuid
															name
															additionalCost
														}
													}
												}
											}
										}
										orderItemVariations {
											total
											items {
												uuid
												count
												variationItems {
													total
													items {
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
					}
				}
			`,
			{
				uuid: tableUuid,
				paid: false
			}
		)

		if (order.data.retrieveTable.orders.total > 0) {
			// Setze Items direkt ohne Merging-Logik (Backend hat bereits gemerged)
			this.setItems(
				order.data.retrieveTable.orders.items[0].orderItems.items.map(
					item => convertOrderItemResourceToOrderItem(item)
				)
			)

			return convertOrderResourceToOrder(
				order.data.retrieveTable.orders.items[0]
			)
		}

		return null
	}

	// Entry: neues Item hinzufügen (delegiert an gemeinsame Merge-Logik)
	// Gibt das tatsächliche Item zurück (entweder das neue oder das gemergte)
	pushNewItem(
		pickedItem: OrderItem,
		bookedItemHandler?: AllItemHandler,
		index?: number
	): OrderItem {
		const incoming: OrderItem = { ...pickedItem } // Kopie zum Schutz vor Seiteneffekten

		// Suche Merge-Ziel (gibt undefined zurück, wenn keines vorhanden)
		const target = this.merger.findMergeTarget(incoming, this.allPickedItems)

		if (target) {
			// Match gefunden -> zusammenführen
			this.merger.mergeIntoExisting(target, incoming)
			// UUIDs vom gebuchten Item übernehmen
			this.syncUuidsFromBookedItem(target, bookedItemHandler)
			return target
		} else {
			// Kein Match -> neues Item einfügen
			// UUIDs vom gebuchten Item übernehmen
			this.syncUuidsFromBookedItem(incoming, bookedItemHandler)
			this.insertAtIndex(incoming, index)
			console.log("Incoming: ", incoming)
			return incoming
		}

		
	}

	findSimilarItem(incoming: OrderItem): OrderItem | null {
		const target = this.merger.findMergeTarget(incoming, this.allPickedItems)
		return target ?? null
	}

	// TODO: In eigene Datei auslagern
	// Bereinigt alle Items im Handler von Elementen mit count 0
	removeEmptyItems() {
		// Durchlaufe alle Items und bereinige sie
		for (let i = this.allPickedItems.length - 1; i >= 0; i--) {
			const item = this.allPickedItems[i]

			// Prüfe Haupt-Item count
			if (item.count <= 0) {
				this.allPickedItems.splice(i, 1)
				continue
			}
			this.removeEmptyOrderItemVariations(item.orderItemVariations)
			this.removeEmptyOrderItems(item)
		}
	}

	// TODO: In eigene Datei auslagern
	removeEmptyOrderItems(orderItem: OrderItem) {
		if (orderItem.orderItems) {
			for (let i = orderItem.orderItems.length - 1; i >= 0; i--) {
				const subItem = orderItem.orderItems[i]
				// Prüfe Sub-Item count
				if (subItem.count <= 0) {
					orderItem.orderItems.splice(i, 1)
					continue
				}
				this.removeEmptyOrderItemVariations(subItem.orderItemVariations)
				this.removeEmptyOrderItems(subItem)
			}
		}
	}

	// TODO: In eigene Datei auslagern
	removeEmptyOrderItemVariations(orderItemVariation: OrderItemVariation[]) {
		if (orderItemVariation) {
			for (let i = orderItemVariation.length - 1; i >= 0; i--) {
				const variation = orderItemVariation[i]
				if (variation.count <= 0) {
					orderItemVariation.splice(i, 1)
				}
			}
		}
	}

	/* Hilfsfunktionen zum Einfügen */
	private insertAtIndex(item: OrderItem, index?: number) {
		if (typeof index === "number") {
			this.allPickedItems.splice(index, 0, item)
		} else {
			this.allPickedItems.push(item)
		}
	}

	// Übernimmt UUIDs vom matchingBookedItem für das Item und dessen Variationen
	private syncUuidsFromBookedItem(
		item: OrderItem,
		bookedItemHandler?: AllItemHandler
	): void {
		if (!bookedItemHandler) return

		const matchingBookedItem = bookedItemHandler.findSimilarItem(item)

		if (!matchingBookedItem) {
			return
		}

		// Übernimm UUID vom gebuchten Item
			item.orderItemVariations?.length > 0 &&
			matchingBookedItem.orderItemVariations?.length > 0
		) {
			for (const variation of item.orderItemVariations) {
				const matchingVariation =
					this.variationComparer.findSimilarVariationItem(
						matchingBookedItem,
						variation
					)
				if (matchingVariation) {
					console.log("Syncing variation UUID from", matchingVariation.uuid)
					variation.uuid = matchingVariation.uuid
				}
			}
		}
		console.log("=== End syncUuidsFromBookedItem ===")
	}

	// consolidateItems delegiert an dieselbe Merge-Implementierung
	consolidateItems(changedItem: OrderItem) {
		const target = this.merger.findMergeTarget(changedItem)
		if (!target || target === changedItem) return

		this.merger.mergeIntoExisting(target, changedItem)
		// Nur löschen, wenn tatsächlich gemerged wurde
		this.deleteItem(changedItem)
	}

	// Nur normale OrderItems
	getOrderItems() {
		return this.allPickedItems
	}

	getItemsCountandId() {
		return this.allPickedItems.map(item => {
			return {
				count: item.count,
				productId: item.product.shortcut,
				orderItemVariations:
					item.orderItemVariations?.map(variation => {
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
					}) ?? []
			}
		})
	}

	// Gibt den Preis eines OfferOrderItems aus dem jeweiligen Handler zurück
	getTotalMenuPrice(pickedItem: OrderItem): number {
		let total = 0

		for (let item of pickedItem.orderItems) {
			// For diverse items use diversePrice, for regular products use product.price
			const itemPrice = item.diversePrice ?? item.product.price
			total += itemPrice * item.count

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

	// Entferne Item aus der Map
	deleteItem(pickedItem: OrderItem): void {
		const index = this.allPickedItems.findIndex(
			item => item.uuid === pickedItem.uuid
		)
		if (index !== -1) {
			this.allPickedItems.splice(index, 1)
		}
	}

	// Prüfen, ob ein bestimmtes Item in der Map enthalten ist
	includes(pickedItem: OrderItem): boolean {
		return this.merger.findMergeTarget(pickedItem) != undefined
	}

	// Reduziere Item oder Lösche es wenn Item = 0
	reduceItem(item: OrderItem, anzahl: number) {
		item.count -= anzahl
		if (item.count <= 0) {
			this.deleteItem(item)
		}
	}

	// Gibt die Anzahl von allen Items zurück
	getNumberOfItems() {
		let number = 0

		for (let item of this.allPickedItems) {
			number += item.count
		}

		return number
	}

	// Entfernt alle Items aus Map
	clearItems() {
		this.allPickedItems = []
	}

	isEmpty() {
		return this.allPickedItems.length === 0
	}

	calculateTotal() {
		let total = 0

		for (const item of this.allPickedItems) {
			total += this.priceCalculator.calculateTotalPrice(item)
		}

		return total
	}

	transferAllItems(AllItemHandlerTarget: AllItemHandler) {
		for (let item of this.allPickedItems) {
			AllItemHandlerTarget.pushNewItem(item)
		}
		this.clearItems()
	}

	// TODO: in eigene Klasse auslagern
	// Erhöht den count eines Composite-Items (Menu/Special) und passt enthaltene Subitems proportional an.
	incrementCompositeCount(item: OrderItem, delta = 1) {
		item.count += delta
		if (!item.orderItems) return
		for (const sub of item.orderItems) {
			// proportion: sub.count / previous item.count (vorherigem Zustand)
			// hier verwenden wir delta als Anzahl von ganzen Menüs/Specials, daher skalieren Subitems linear
			sub.count += (sub.count / Math.max(item.count - delta, 1)) * delta
			if (sub.orderItemVariations) {
				for (const v of sub.orderItemVariations) {
					v.count += (v.count / Math.max(item.count - delta, 1)) * delta
				}
			}
		}
	}

	// TODO: in eigene Klasse auslagern
	// Verringert den count eines Composite-Items und passt enthaltene Subitems proportional an.
	decrementCompositeCount(item: OrderItem, delta = 1) {
		item.count = Math.max(0, item.count - delta)
		if (!item.orderItems || item.count === 0) return
		for (const sub of item.orderItems) {
			sub.count = Math.max(
				0,
				sub.count - (sub.count / (item.count + delta)) * delta
			)
			if (sub.orderItemVariations) {
				for (const v of sub.orderItemVariations) {
					v.count = Math.max(
						0,
						v.count - (v.count / (item.count + delta)) * delta
					)
				}
			}
		}
	}

	// Klont ein OrderItem sauber (statt JSON.stringify/parse überall)
	cloneOrderItem<T extends OrderItem>(item: T): T {
		// tiefer Klon: Produkte/Variationen/Subitems klonen
		return structuredClone(item)
	}
}
