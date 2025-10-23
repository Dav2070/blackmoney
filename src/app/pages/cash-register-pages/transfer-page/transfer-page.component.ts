import { Component } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import {
	faChevronsRight,
	faChevronsLeft
} from "@fortawesome/pro-regular-svg-icons"
import { AllItemHandler } from "src/app/models/cash-register/all-item-handler.model"
import { LocalizationService } from "src/app/services/localization-service"
import { DataService } from "src/app/services/data-service"
import { ApiService } from "src/app/services/api-service"
import { Table } from "src/app/models/Table"
import { OrderItem } from "src/app/models/OrderItem"
import { Room } from "src/app/models/Room"
import { OrderItemVariation } from "src/app/models/OrderItemVariation"
import { Order } from "src/app/models/Order"
import { calculateTotalPriceOfOrderItem } from "src/app/utils"

@Component({
	templateUrl: "./transfer-page.component.html",
	styleUrl: "./transfer-page.component.scss",
	standalone: false
})
export class TransferPageComponent {
	locale = this.localizationService.locale.transferPage
	faChevronsRight = faChevronsRight
	faChevronsLeft = faChevronsLeft
	bookedItemsLeft = new AllItemHandler()
	bookedItemsRight = new AllItemHandler()
	tableLeft: Table = null
	tableRight: Table = null
	tableLeftRoom: Room = null
	tableRightRoom: Room = null
	tableLeftOrder: Order = null
	tableRightOrder: Order = null
	ordersLoading: boolean = true
	isItemPopupVisible: boolean = false
	lastClickedItem: OrderItem
	tmpVariations: OrderItem
	tmpAnzahl: number

	tmpSend: AllItemHandler
	tmpReceiver: AllItemHandler

	calculateTotalPriceOfOrderItem = calculateTotalPriceOfOrderItem

	constructor(
		private localizationService: LocalizationService,
		private dataService: DataService,
		private activatedRoute: ActivatedRoute,
		private apiService: ApiService,
		private router: Router
	) {}

	async ngOnInit() {
		await this.dataService.restaurantPromiseHolder.AwaitResult()

		const uuid1 = this.activatedRoute.snapshot.paramMap.get("uuid1")
		const uuid2 = this.activatedRoute.snapshot.paramMap.get("uuid2")

		for (let room of this.dataService.restaurant.rooms) {
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
			this.router.navigate(["dashboard", "tables", this.tableLeft.uuid])
			return
		} else if (this.tableLeft == null || this.tableRight == null) {
			this.router.navigate(["dashboard"])
			return
		}

		this.tableLeftOrder = await this.bookedItemsLeft.loadItemsFromOrder(
			this.apiService,
			this.tableLeft.uuid
		)
		this.tableRightOrder = await this.bookedItemsRight.loadItemsFromOrder(
			this.apiService,
			this.tableRight.uuid
		)

		this.ordersLoading = false
	}

	navigateToBookingPage(event: MouseEvent) {
		event.preventDefault()
		this.router.navigate(["dashboard", "tables", this.tableLeft.uuid])
	}

	//Berechnet den Preis aller Items eines Tisches
	showTotal(bookedItems: AllItemHandler) {
		return bookedItems.calculateTotal().toFixed(2).replace(".", ",") + " €"
	}

	transferItem(
		item: OrderItem,
		send: AllItemHandler,
		receiving: AllItemHandler
	) {
		let anzahl = 1
		if (this.tmpAnzahl > 0) {
			anzahl = this.tmpAnzahl
		}
		if (item.count < anzahl) {
			window.alert(
				"Es können maximal " + item.count + " Items übertragen werden"
			)
		} else {
			if (item.orderItemVariations.length == 0) {
				send.reduceItem(item, anzahl)
				receiving.pushNewItem({ ...item, count: anzahl })
			}
			if (item.orderItemVariations.length == 1) {
				this.tmpSend = send
				this.tmpReceiver = receiving
				this.lastClickedItem = item
				this.tmpVariations = JSON.parse(JSON.stringify(item))

				this.tmpVariations.count = anzahl
				for (let variation of this.tmpVariations.orderItemVariations) {
					variation.count = anzahl
				}
				this.transferVariation()
			}
			if (item.orderItemVariations.length > 1) {
				this.tmpSend = send
				this.tmpReceiver = receiving
				this.lastClickedItem = item
				this.tmpVariations = JSON.parse(JSON.stringify(item))
				this.tmpVariations.count = 0
				for (let variation of this.tmpVariations.orderItemVariations) {
					variation.count = 0
				}

				this.isItemPopupVisible = true
			}
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
							item.id === variation.variationItems[index].id
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

	checkIfMinus(variation: OrderItemVariation) {
		if (variation.count <= 0) {
			return true
		}
		return false
	}

	checkIfPlus(variation: OrderItemVariation) {
		let variationCount = this.lastClickedItem.orderItemVariations.find(
			v =>
				v.variationItems.length === variation.variationItems.length &&
				v.variationItems.every(
					(item, index) =>
						item.name === variation.variationItems[index].name
					//&&
					//item.uuid === variation.variationItems[index].uuid
				)
		)?.count

		if (variationCount <= variation.count) {
			return true
		}
		return false
	}

	async updateTables(route: string) {
		await this.apiService.updateOrder("uuid", {
			uuid: this.tableLeftOrder.uuid,
			orderItems: this.bookedItemsLeft.getItemsCountandId()
		})

		await this.apiService.updateOrder("uuid", {
			uuid: this.tableRightOrder.uuid,
			orderItems: this.bookedItemsRight.getItemsCountandId()
		})

		this.router
			.navigate([route], { relativeTo: this.activatedRoute })
			.then(() => {
				window.location.reload()
			})
	}

	checkifVariationPicked() {
		let picked = true
		if (this.tmpVariations != null) {
			for (let variation of this.tmpVariations.orderItemVariations) {
				if (variation.count > 0) {
					picked = false
				}
			}
		}
		return picked
	}
}
