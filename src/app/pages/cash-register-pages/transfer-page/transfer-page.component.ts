import { Component } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { AllItemHandler } from "src/app/models/cash-register/all-item-handler.model"
import { PickedItem } from "src/app/models/cash-register/picked-item.model"
import { Variation } from "src/app/models/cash-register/variation.model"
import { DataService } from "src/app/services/data-service"
import { ApiService } from "src/app/services/api-service"
import { convertOrderItemResourceToOrderItem } from "src/app/utils"
import { Table } from "src/app/models/Table"
import { OrderItem } from "src/app/models/OrderItem"
import { Room } from "src/app/models/Room"
import { OrderItemVariation } from "src/app/models/OrderItemVariation"
import { Order } from "src/app/models/Order"

@Component({
	templateUrl: "./transfer-page.component.html",
	styleUrl: "./transfer-page.component.scss",
	standalone: false
})
export class TransferPageComponent {
	numberpad: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
	bookedItemsLeft = new AllItemHandler()
	bookedItemsRight = new AllItemHandler()
	tableLeft: Table = null
	tableRight: Table = null
	tableLeftRoom: Room = null
	tableRightRoom: Room = null
	console: string
	consoleActive: boolean = false
	isItemPopupVisible: boolean = false
	lastClickedItem: OrderItem
	tmpVariations: OrderItem
	tmpAnzahl: number

	tmpSend: AllItemHandler
	tmpReceiver: AllItemHandler

	constructor(
		private dataService: DataService,
		private activatedRoute: ActivatedRoute,
		private apiService: ApiService,
		private router: Router
	) {}

	async ngOnInit() {
		await this.dataService.companyPromiseHolder.AwaitResult()

		const uuid1 = this.activatedRoute.snapshot.paramMap.get("uuid1")
		const uuid2 = this.activatedRoute.snapshot.paramMap.get("uuid2")

		for (let room of this.dataService.company.rooms) {
			for (let table of room.tables) {
				if (table.uuid === uuid1) {
					this.tableLeft = table
					this.tableLeftRoom = room
				}

				if (table.uuid === uuid2) {
					this.tableRight = table
					this.tableRightRoom = room
				}
			}

			if (this.tableLeft && this.tableRight) {
				break
			}
		}

		if (this.tableLeft != null && this.tableRight == null) {
			this.router.navigate(["tables", this.tableLeft.uuid])
			return
		} else if (this.tableLeft == null || this.tableRight == null) {
			this.router.navigate(["tables"])
			return
		}

		await this.loadOrders(this.tableLeft.uuid, this.bookedItemsLeft)
		await this.loadOrders(this.tableRight.uuid, this.bookedItemsRight)
	}

	//Aktualisiere Bestellungen aus DB
	async loadOrders(tableUuid: string, itemHandler: AllItemHandler) {
		let order = await this.apiService.retrieveTable(
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
												uuid
												name
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
			itemHandler.clearItems()

			for (let item of order.data.retrieveTable.orders.items[0].orderItems
				.items) {
				itemHandler.pushNewItem(convertOrderItemResourceToOrderItem(item))
			}
		}
	}

	//Berechnet den Preis aller Items eines Tisches
	showTotal(bookedItems: AllItemHandler) {
		// return bookedItems.calculatTotal().toFixed(2) + "€"
	}

	//Fügt die gedrückte Nummer in die Konsole ein
	consoleInput(input: string) {
		if (this.consoleActive == false) {
			this.consoleActive = true
			this.console = ""
		}
		this.console += input
	}

	clearInput() {
		this.console = ""
		this.consoleActive = false
	}

	transferItem(
		item: OrderItem,
		send: AllItemHandler,
		receiving: AllItemHandler
	) {
		if (item.orderItemVariations.length > 0) {
			this.tmpSend = send
			this.tmpReceiver = receiving
			this.lastClickedItem = item
			this.tmpVariations = JSON.parse(JSON.stringify(item))
			this.tmpVariations.count = 0
			for (let variation of this.tmpVariations.orderItemVariations) {
				variation.count = 0
			}

			this.isItemPopupVisible = true
		} else {
			send.reduceItem(item, 1)
			receiving.pushNewItem({ ...item, count: 1 })
		}

		// let anzahl = 0
		// if (this.consoleActive) {
		// 	anzahl = parseInt(this.console)
		// }
		// if (item.pickedVariation) {
		// 	if (anzahl > item.anzahl) {
		// 		window.alert(
		// 			"Es können maximal " + item.anzahl + " Items übertragen werden"
		// 		)
		// 	} else {
		// 		this.lastClickedItem = { ...item }
		// 		this.tmpSend = send
		// 		this.tmpReceiver = receiving
		// 		this.isItemPopupVisible = true
		// 		if (anzahl > 0) {
		// 			this.tmpAnzahl = anzahl
		// 		}
		// 	}
		// } else {
		// 	if (anzahl === 0) {
		// 		anzahl = 1
		// 	}
		// 	if (anzahl > item.anzahl) {
		// 		window.alert(
		// 			"Es können nur maximal " + item.anzahl + " übertragen werden"
		// 		)
		// 	} else {
		// 		send.reduceItem(item, anzahl)
		// 		receiving.pushNewItem(
		// 			new PickedItem(
		// 				{ id: item.id, price: item.price, name: item.name },
		// 				anzahl
		// 			)
		// 		)
		// 	}
		// }
		// this.clearInput()
	}

	//Entfernt eine Variation
	removeVariation(variation: OrderItemVariation) {
		this.tmpVariations.count -= 1
		variation.count -= 1
	}

	//Checkt ob Limit der Anzahl erreicht ist
	checkLimitAnzahl(id: number) {
		/*let anzahl = this.lastClickedItem.pickedVariation.get(id).anzahl
		if (this.tmpAnzahl > 0) {
			anzahl = this.tmpAnzahl
		}

		if (this.tmpVariations.has(id)) {
			if (anzahl === this.tmpVariations.get(id).anzahl) {
				return true
			}
		}

		return false*/
	}

	//Erhöht eine Variation um eins
	addVariation(variation: OrderItemVariation) {
		this.tmpVariations.count += 1
		variation.count += 1
	}

	//Checkt ob mindestens eine Variation ausgewählt wurde oder die Anzahl an Variationen ausgewählt wurde die man buchen möchte
	checkPickedVariation() {
		/*if (this.tmpAnzahl > 0) {
			let anzahl = 0
			for (let variation of this.tmpVariations.values()) {
				anzahl += variation.anzahl
			}
			if (anzahl === this.tmpAnzahl) {
				return false
			}
		} else {
			for (let variation of this.tmpVariations.values()) {
				if (variation.anzahl > 0) {
					return false
				}
			}
		}
		return true*/
	}

	//Schließt Popup und setzt alle Variablen default
	closeItemPopup() {
		this.isItemPopupVisible = !this.isItemPopupVisible
		this.tmpVariations = null
		this.lastClickedItem = undefined
		this.tmpAnzahl = 0
	}

	//Fügt die ausgewählten Items mit Variationen zum anderen Tisch
	sendVariation() {
		// let number = 0
		// for (let variation of this.tmpVariations.values()) {
		// 	number += variation.anzahl
		// }
		// this.tmpReceiver.pushNewItem(
		// 	new PickedItem(
		// 		this.lastClickedItem,
		// 		number,
		// 		new Map(this.tmpVariations)
		// 	)
		// )
		// this.tmpSend.reduceItem(
		// 	new PickedItem(
		// 		this.lastClickedItem,
		// 		number,
		// 		new Map(this.tmpVariations)
		// 	),
		// 	number
		// )
		// this.closeItemPopup()
	}
	transferVariation() {
		this.tmpVariations.orderItemVariations =
			this.tmpVariations.orderItemVariations.filter(v => v.count > 0)
		this.tmpReceiver.pushNewItem(this.tmpVariations)
		this.tmpSend.reduceItem(this.lastClickedItem, this.tmpVariations.count)
		for (
			let i = this.lastClickedItem.orderItemVariations.length - 1;
			i >= 0;
			i--
		) {
			const variation = this.lastClickedItem.orderItemVariations[i]
			const matchingVariation = this.tmpVariations.orderItemVariations.find(
				v =>
					v.variationItems.length === variation.variationItems.length &&
					v.variationItems.every(
						(item, index) =>
							item.name === variation.variationItems[index].name
					)
			)

			if (matchingVariation) {
				variation.count -= matchingVariation.count

				// Entfernen, wenn der count kleiner oder gleich 0 ist
				if (variation.count <= 0) {
					this.lastClickedItem.orderItemVariations.splice(i, 1)
				}
			}
		}

		this.isItemPopupVisible = false
	}
}
