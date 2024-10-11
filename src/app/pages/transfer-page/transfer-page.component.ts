import { Component } from "@angular/core"
import { Item } from "src/app/models/item.model"
import { Variation } from "src/app/models/variation.model"

@Component({
	templateUrl: "./transfer-page.component.html",
	styleUrl: "./transfer-page.component.scss"
})
export class TransferPageComponent {
	bookedItems = new Map<Item, Map<Variation, number>>()
	numberpad: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

	//Berechnet den Preis der hinzugefügten Items
	calculateTotalPrice(
		itemPrice: number,
		variationPrice: number,
		number: number
	) {
		return ((itemPrice + variationPrice) * number).toFixed(2)
	}
}
