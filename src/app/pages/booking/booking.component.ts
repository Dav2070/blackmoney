import { Component } from "@angular/core"
import { Inventory } from "src/app/models/inventory.model"
import { Item } from "src/app/models/item.model"

@Component({
	templateUrl: "./booking.component.html",
	styleUrl: "./booking.component.scss"
})
export class BookingComponent {
	drinks: Inventory[] = [
		{ name: "Alkoholfrei", items: [{ id: 1, price: 4.0, name: "Cola 0,5" }] },
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

	selectedInventory: Item[] = this.drinks[0].items;

	bookedItems = new Map<Item, number>();

	numberpad:number[]= [1,2,3,4,5,6,7,8,9]

	constructor() {}

	ngOnInit() {}

	//Lade Items zur ausgewählten Kategorie
	changeSelectedInventory(items: Item[]) {
		this.selectedInventory = items
	}

	//Füge Item der Liste an bestellten Artikeln hinzu
	selectItem(item: Item) {
		if(this.bookedItems.has(item)){
			let value=this.bookedItems.get(item)
			this.bookedItems.set(item,value+1);
		}
		else{
			this.bookedItems.set(item,1);
		}
		
		
	}
}
