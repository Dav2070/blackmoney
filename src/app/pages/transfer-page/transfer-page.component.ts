import { Component } from "@angular/core"
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

	constructor(private hardcodeService: HardcodeService) {}

	async ngOnInit() {
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
}
