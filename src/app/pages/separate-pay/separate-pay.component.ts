import { Component } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { AllItemHandler } from "src/app/models/all-item-handler.model"
import { HardcodeService } from "src/app/services/hardcode-service"

@Component({
	templateUrl: "./separate-pay.component.html",
	styleUrl: "./separate-pay.component.scss"
})
export class SeparatePayComponent {
	date: String = new Date().toLocaleString("de-DE")
	bediener: String = "Bediener 1"

	numberpad: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
	bookedItems = new AllItemHandler()
	bills: AllItemHandler[] = [new AllItemHandler()]
	tableUuid: number
	console: string
	consoleActive: boolean = false

	activeBill: AllItemHandler = this.bills[0]

	constructor(
		private hardcodeService: HardcodeService,
		private activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		this.tableUuid = +this.activatedRoute.snapshot.paramMap.get("uuid")
		this.bookedItems = this.hardcodeService.getItemsofTable(40)
	}

	//Berechnet den Preis aller Items eines Tisches
	showTotal(bookedItems: AllItemHandler) {
		return bookedItems.calculatTotal().toFixed(2) + "€"
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
		let tmpTotal = 0
		for (let bill of this.bills) {
			tmpTotal += bill.calculatTotal()
		}
		return tmpTotal.toFixed(2) + "€"
	}

	setActiveBill(bill: AllItemHandler) {
		this.activeBill = bill
	}

	deleteBill() {
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
		if (this.bookedItems.getNumberOfItems() <= this.bills.length) {
			return true
		}
		return false
	}
}
