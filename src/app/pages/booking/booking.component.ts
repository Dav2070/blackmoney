import { Component } from "@angular/core"
import { Inventory } from "src/app/models/inventory.model"
import { Item } from "src/app/models/item.model"

@Component({
	templateUrl: "./booking.component.html",
	styleUrl: "./booking.component.scss"
})
export class BookingComponent {
	drinks: Inventory[] = [
		{ name: "Alkoholfrei", items: [{ id: 1, price: 5.0, name: "Cola 0,5" }] },
		{ name: "Bier", items: [{ id: 2, price: 3.7, name: "Pils 0,4" }] },
		{
			name: "Wein",
			items: [{ id: 3, price: 6.7, name: "Grauburunder 0,2" }]
		},
		{ name: "Schnapps", items: [{ id: 4, price: 3.0, name: "Ouzo" }] }
	]
	dishes: Inventory[] = [
		{
			name: "Vorspeisen",
			items: [{ id: 5, price: 14.7, name: "Vorspeisenteller" }]
		},
		{
			name: "Hauptgerichte",
			items: [{ id: 6, price: 35.7, name: "Rinderfilet" }]
		},
		{ name: "Beilagen", items: [{ id: 7, price: 4.7, name: "Pommes" }] },
		{ name: "Dessert", items: [{ id: 8, price: 6.4, name: "Tiramisu" }] }
	]

	selectedInventory: Item[] = this.drinks[0].items

	bookedItems = new Map<Item, number>()

	numberpad: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

	newItems = new Map<Item, number>()

	endpreis: number = 0.0

	lastClickedItem: Item | null = null

	lastClickedItemSource: "new" | "booked" | null = null

	total: number = 0.0

	constructor() {}

	ngOnInit() {}

	//Lade Items zur ausgewählten Kategorie
	changeSelectedInventory(items: Item[]) {
		this.selectedInventory = items
	}

	//Füge Item der Liste an neu bestellten Artikeln hinzu
	selectItem(item: Item) {
		if (this.newItems.has(item)) {
			let value = this.newItems.get(item)
			this.newItems.set(item, value + 1)
		} else {
			this.newItems.set(item, 1)
		}
		this.showTotal()
	}

	//Aktualisiert den Gesamtpreis
	showTotal() {
		this.total = 0

		for (let [key, value] of this.newItems) {
			this.total += key.price * value
		}
		for (let [key, value] of this.bookedItems) {
			this.total += key.price * value
		}
	}

	//Speichert das zuletzt angeklickte item in einer Variable
	onCardClick(item: Item, source: "new" | "booked") {
		this.lastClickedItem = item
		this.lastClickedItemSource = source
	}

	//Löscht das zuletzt angeklickte item
	deleteItem() {
		if (this.lastClickedItem) {
			if (this.lastClickedItemSource === "new") {
				this.newItems.delete(this.lastClickedItem)
			} else if (this.lastClickedItemSource === "booked") {
				this.bookedItems.delete(this.lastClickedItem)
			}
			this.lastClickedItem = null
			this.lastClickedItemSource = null
			this.showTotal()
		}
	}

	//Fügt Items der Liste an bestellten Artikeln hinzu
	sendOrder() {
		for (let [key, value] of this.newItems) {
			if (this.bookedItems.has(key)) {
				let number = this.bookedItems.get(key)
				this.bookedItems.set(key, number + value)
			} else {
				this.bookedItems.set(key, value)
			}
		}
		this.newItems.clear()
		this.showTotal()
	}

	//Berechnet den Preis der hinzugefügten Items
	calculateTotalPrice(price: number, value: number) {
		return (price * value).toFixed(2)
	}
}
