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

	endpreise =  new Map<Item, number>()

	bookedendpreise = new Map<Item, number>()

	total: number;

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
		this.endpreise.set(item, item.price * (this.newItems.get(item) || 1))
	}

	//Aktualisiert den Gesamtpreis
	showTotal(){
		this.total = 0;
 		 for (let preis of this.bookedendpreise.values()) {
    		this.total += preis;
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

			if(this.bookedendpreise.has(key)){
				this.bookedendpreise.set(key, this.bookedendpreise.get(key) + this.endpreise.get(key))
			} else {
				this.bookedendpreise.set(key, this.endpreise.get(key))
			}
		}
		this.newItems.clear();
		this.showTotal()
	}
}
