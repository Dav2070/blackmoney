import { Component } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { AllItemHandler } from "src/app/models/all-item-handler.model"
import { HardcodeService } from "src/app/services/hardcode-service"

@Component({
	templateUrl: "./separate-pay.component.html",
	styleUrl: "./separate-pay.component.scss"
})
export class SeparatePayComponent {
	numberpad: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
	bookedItems = new AllItemHandler()
	bills: AllItemHandler[] = [new AllItemHandler()]
	tableUuid: number
	console: string
	consoleActive: boolean = false

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
	}

	calculateTotalBills() {
		let tmpTotal = 0
		for (let bill of this.bills) {
			tmpTotal += bill.calculatTotal()
		}
		return tmpTotal.toFixed(2) + "€"
	}
}
