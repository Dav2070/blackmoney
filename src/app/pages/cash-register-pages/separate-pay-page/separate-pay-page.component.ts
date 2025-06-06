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

	activeBill: AllItemHandler = this.bills[0]

	isItemPopupVisible: boolean = false
	lastClickedItem: PickedItem
	tmpVariations = new Map<number, Variation>()
	tmpAnzahl: number

	tmpSend: AllItemHandler
	tmpReceiver: AllItemHandler

	calculateTotalPriceOfOrderItem = calculateTotalPriceOfOrderItem

	constructor(
		private hardcodeService: HardcodeService,
		private activatedRoute: ActivatedRoute,
		private apiService: ApiService,
		private dataService: DataService
	) {}

	async ngOnInit() {
		await this.dataService.companyPromiseHolder.AwaitResult()

		const uuid = this.activatedRoute.snapshot.paramMap.get("uuid")

		for (let room of this.dataService.company.rooms) {
			this.table = room.tables.find(table => table.uuid === uuid)
			if (this.table) break
		}

		await this.bookedItems.loadItemsFromOrder(
			this.apiService,
			this.table.uuid
		)
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
	removeVariation(variation: Variation) {
		if (variation.anzahl === 1) {
			this.tmpVariations.delete(variation.id)
		} else {
			this.tmpVariations.get(variation.id).anzahl -= 1
		}
	}

	//Checkt ob Limit der Anzahl erreicht ist
	checkLimitAnzahl(id: number) {
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
	}

	//Erhöht eine Variation um eins
	addVariation(variation: Variation) {
		if (this.tmpVariations.has(variation.id)) {
			this.tmpVariations.get(variation.id).anzahl += 1
		} else {
			this.tmpVariations.set(variation.id, { ...variation, anzahl: 1 })
		}
	}

	//Checkt ob mindestens eine Variation ausgewählt wurde oder die Anzahl an Variationen ausgewählt wurde die man buchen möchte
	checkPickedVariation() {
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
	}

	//Schließt Popup und setzt alle Variablen default
	closeItemPopup() {
		this.isItemPopupVisible = !this.isItemPopupVisible
		this.tmpVariations.clear()
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

	createBill(payment: string) {
		let bill = new Bill(
			"Bediener 1",
			this.table.uuid,
			this.bookedItems,
			new Date(),
			payment,
			true
		)
		this.activeBill.clearItems()

		if (this.bills.length > 1) {
			this.deleteBill()
		}
	}
}
