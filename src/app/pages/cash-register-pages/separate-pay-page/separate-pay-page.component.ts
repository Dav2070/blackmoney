import { Component } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { AllItemHandler } from "src/app/models/cash-register/all-item-handler.model"
import { Bill } from "src/app/models/cash-register/bill.model"
import { PickedItem } from "src/app/models/cash-register/picked-item.model"
import { Variation } from "src/app/models/cash-register/variation.model"
import { HardcodeService } from "src/app/services/hardcode-service"
import { OrderItem } from "src/app/models/OrderItem"
import { ApiService } from "src/app/services/api-service"
import { Table } from "src/app/models/Table"
import { DataService } from "src/app/services/data-service"
import { calculateTotalPriceOfOrderItem } from "src/app/utils"
import { OrderItemVariation } from "src/app/models/OrderItemVariation"
import { PaymentMethod } from "src/app/types"
import { Order } from "src/app/models/Order"

@Component({
	templateUrl: "./separate-pay-page.component.html",
	styleUrl: "./separate-pay-page.component.scss",
	standalone: false
})
export class SeparatePayPageComponent {
	numberpad: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
	bookedItems = new AllItemHandler()
	bills: AllItemHandler[] = [new AllItemHandler()]
	table: Table = null
	console: string
	consoleActive: boolean = false

	orderUuid: string = ""
	billUuid: string = ""
	activeBill: AllItemHandler = this.bills[0]

	isItemPopupVisible: boolean = false
	lastClickedItem: OrderItem
	tmpVariations: OrderItem
	tmpAnzahl: number

	tmpSend: AllItemHandler
	tmpReceiver: AllItemHandler

	calculateTotalPriceOfOrderItem = calculateTotalPriceOfOrderItem

	constructor(
		private hardcodeService: HardcodeService,
		private activatedRoute: ActivatedRoute,
		private apiService: ApiService,
		private dataService: DataService
	) { }

	async ngOnInit() {
		await this.dataService.restaurantPromiseHolder.AwaitResult()

		const uuid = this.activatedRoute.snapshot.paramMap.get("uuid")

		for (let room of this.dataService.restaurant.rooms) {
			this.table = room.tables.find(table => table.uuid === uuid)
			if (this.table) break
		}

		let order = await this.bookedItems.loadItemsFromOrder(
			this.apiService,
			this.table.uuid
		)

		this.orderUuid = order.uuid
		this.billUuid = order.bill.uuid
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

	addBill() {
		this.bills.push(new AllItemHandler())
		this.activeBill = this.bills[this.bills.length - 1]
	}

	calculateTotalBills() {
		// let tmpTotal = 0
		// for (let bill of this.bills) {
		// 	tmpTotal += bill.calculatTotal()
		// }
		// return tmpTotal.toFixed(2) + "€"
	}

	setActiveBill(bill: AllItemHandler) {
		this.activeBill = bill
	}

	deleteBill() {
		this.bookedItems.transferAllItems(this.activeBill)
		let index = this.bills.indexOf(this.activeBill)

		this.bills.splice(index, 1)
		//Setze die nächste aktive Rechnung
		if (this.bills.length > 0) {
			if (index === this.bills.length) {
				this.activeBill = this.bills[index - 1]
			} else {
				this.activeBill = this.bills[index]
			}
		}
	}

	checkMaxBills() {
		if (this.bookedItems.getNumberOfItems() == 1 && this.bills.length == 1) {
			return false
		}
		if (this.bookedItems.getNumberOfItems() <= this.bills.length) {
			return true
		}

		return false
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

		return variationCount <= variation.count
	}

	checkIfMinus(variation: OrderItemVariation) {
		if (variation.count <= 0) {
			return true
		}
		return false
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

	//Entfernt eine Variation
	removeVariation(variation: OrderItemVariation) {
		this.tmpVariations.count -= 1
		variation.count -= 1
	}

	//Checkt ob Limit der Anzahl erreicht ist
	checkLimitAnzahl(id: number) {
		/*
		let anzahl = this.lastClickedItem.pickedVariation.get(id).anzahl
		if (this.tmpAnzahl > 0) {
			anzahl = this.tmpAnzahl
		}

		if (this.tmpVariations.has(id)) {
			if (anzahl === this.tmpVariations.get(id).anzahl) {
				return true
			}
		}

		return false 
		*/
	}

	//Erhöht eine Variation um eins
	addVariation(variation: OrderItemVariation) {
		this.tmpVariations.count += 1
		variation.count += 1
	}

	//Checkt ob mindestens eine Variation ausgewählt wurde oder die Anzahl an Variationen ausgewählt wurde die man buchen möchte
	checkPickedVariation() {
		/*
		if (this.tmpAnzahl > 0) {
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
		return true
		*/
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

	async createBill(payment: PaymentMethod) {
		interface AddProductsInput {
			uuid: string
			count: number
			variations?: AddProductsInputVariation[]
		}
		interface AddProductsInputVariation {
			variationItemUuids: string[]
			count: number
		}
		/*await this.apiService.completeOrder("uuid", { uuid: this.orderUuid, paymentMethod: payment })
		window.location.reload()*/
		console.log(this.activeBill, payment)
		await this.apiService.updateOrder("uuid", { uuid: this.orderUuid, orderItems: this.bookedItems.getItemsCountandId() })
		let newOrder = await this.apiService.createOrder("uuid", { tableUuid: this.table.uuid })
		await this.apiService.addProductsToOrder("uuid", {
			uuid: newOrder.data.createOrder.uuid,
			products: this.activeBill.getAllPickedItems().map(item => {
				let variations: AddProductsInputVariation[] = []
				if (item.orderItemVariations.length > 0) {
					variations = item.orderItemVariations.map(variation => ({
						variationItemUuids: variation.variationItems.map(v => v.uuid),
						count: variation.count
					}))
				}
				return {
					uuid: item.product.uuid,
					count: item.count,
					variations
				} as AddProductsInput
			})
		})
		await this.apiService.completeOrder("uuid", { uuid: newOrder.data.createOrder.uuid, billUuid: this.billUuid, paymentMethod: payment })
		this.deleteBill()
	}
}
