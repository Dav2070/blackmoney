import { Component } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { Item } from "src/app/models/item.model"
import { Variation } from "src/app/models/variation.model"
import { HardcodeService } from "src/app/services/hardcode-service"

@Component({
	templateUrl: "./transfer-page.component.html",
	styleUrl: "./transfer-page.component.scss"
})
export class TransferPageComponent {
	numberpad: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
	bookedItemsLeft = new Map<Item, Map<Variation, number>>()
	bookedItemsRight = new Map<Item, Map<Variation, number>>()
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

	//Berechnet den Preis der hinzugefügten Items
	calculateTotalPrice(
		itemPrice: number,
		variationPrice: number,
		number: number
	) {
		return ((itemPrice + variationPrice) * number).toFixed(2)
	}

	//Berechnet den Preis aller Items eines Tisches
	showTotal(bookedItem: Map<Item, Map<Variation, number>>) {
		var tmpTotal: number = 0

		for (let [key, value] of bookedItem) {
			for (let [variation, number] of value) {
				tmpTotal += (variation.preis + key.price) * number
			}
		}
		return tmpTotal.toFixed(2) + "€"
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
