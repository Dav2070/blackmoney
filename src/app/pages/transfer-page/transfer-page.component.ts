import { Component } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { AllItemHandler } from "src/app/models/all-item-handler.model"
import { Item } from "src/app/models/item.model"
import { Variation } from "src/app/models/variation.model"
import { HardcodeService } from "src/app/services/hardcode-service"

@Component({
	templateUrl: "./transfer-page.component.html",
	styleUrl: "./transfer-page.component.scss"
})
export class TransferPageComponent {
	date: String = new Date().toLocaleString("de-DE")
	bediener: String = "Bediener 1"

	numberpad: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
	bookedItemsLeft = new AllItemHandler()
	bookedItemsRight = new AllItemHandler()
	tableLeftUuid: number
	tableRightUuid: number
	console: string
	consoleActive: boolean = false

	constructor(
		private hardcodeService: HardcodeService,
		private activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		this.tableLeftUuid = +this.activatedRoute.snapshot.paramMap.get("uuid")
		this.tableRightUuid =
			+this.activatedRoute.snapshot.paramMap.get("console")
		this.bookedItemsLeft = this.hardcodeService.getItemsofTable(40)
		this.bookedItemsRight = this.hardcodeService.getItemsofTable(50)
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
}
