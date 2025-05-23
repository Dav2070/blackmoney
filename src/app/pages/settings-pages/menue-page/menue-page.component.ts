import { Component } from "@angular/core"
import { Inventory } from "src/app/models/cash-register/inventory.model"

@Component({
	selector: "app-menue-page",
	templateUrl: "./menue-page.component.html",
	styleUrl: "./menue-page.component.scss",
	standalone: false
})
export class MenuePageComponent {
	selectedInventory: Inventory = {
		name: "Vorspeisen",
		items: [
			{
				id: 5,
				price: 14.7,
				name: "Vorspeisenteller"
			}
		]
	}
	foodInventory: Inventory[] = [
		{
			name: "Vorspeisen",
			items: [
				{
					id: 5,
					price: 14.7,
					name: "Vorspeisenteller"
				}
			]
		},
		{
			name: "Hauptgerichte",
			items: [
				{
					id: 6,
					price: 35.7,
					name: "Rinderfilet",
					variations: [
						{ id: 1, name: "Pommes", preis: 0 },
						{ id: 2, name: "Reis", preis: 1 },
						{ id: 3, name: "Kroketten", preis: 1.5 }
					]
				}
			]
		},
		{
			name: "Beilagen",
			items: [
				{
					id: 7,
					price: 4.7,
					name: "Pommes"
				}
			]
		},
		{
			name: "Dessert",
			items: [
				{
					id: 8,
					price: 6.4,
					name: "Tiramisu"
				}
			]
		}
	]

	drinkInventory: Inventory[] = [
		{
			name: "Alkoholfrei",
			items: [
				{
					id: 1,
					price: 5.0,
					name: "Cola 0,5"
				}
			]
		},
		{
			name: "Bier",
			items: [
				{
					id: 2,
					price: 3.7,
					name: "Pils 0,4"
				}
			]
		},
		{
			name: "Wein",
			items: [
				{
					id: 3,
					price: 6.7,
					name: "Grauburunder 0,2"
				}
			]
		},
		{
			name: "Schnapps",
			items: [
				{
					id: 4,
					price: 3.0,
					name: "Ouzo"
				}
			]
		}
	]

	setInventory(inventory: Inventory) {
		this.selectedInventory = inventory
		console.log(inventory)
	}

		addNewCategory(type: 'food' | 'drink') {
		const name = prompt("Bitte geben Sie den Kategorienamen ein:");
		if (!name) return;

		const newCategory: Inventory = {
			name,
			items: []
		};

		if (type === 'food') {
			this.foodInventory.push(newCategory);
		} else {
			this.drinkInventory.push(newCategory);
		}

		this.selectedInventory = newCategory;
	}
}
