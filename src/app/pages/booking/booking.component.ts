import { Component } from "@angular/core"
import { Inventory } from "src/app/models/inventory.model"
import { Item } from "src/app/models/item.model"
import { Variation } from "src/app/models/variation.model"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { isServer } from "src/app/utils"

@Component({
	templateUrl: "./booking.component.html",
	styleUrl: "./booking.component.scss"
})
export class BookingComponent {
	drinks: Inventory[] = [
		{
			name: "Alkoholfrei",
			items: [
				{
					id: 1,
					price: 5.0,
					name: "Cola 0,5",
					variations: [],
					pickedVariation: { name: null, preis: null }
				}
			]
		},
		{
			name: "Bier",
			items: [
				{
					id: 2,
					price: 3.7,
					name: "Pils 0,4",
					variations: [],
					pickedVariation: { name: null, preis: null }
				}
			]
		},
		{
			name: "Wein",
			items: [
				{
					id: 3,
					price: 6.7,
					name: "Grauburunder 0,2",
					variations: [],
					pickedVariation: { name: null, preis: null }
				}
			]
		},
		{
			name: "Schnapps",
			items: [
				{
					id: 4,
					price: 3.0,
					name: "Ouzo",
					variations: [],
					pickedVariation: { name: null, preis: null }
				}
			]
		}
	]
	dishes: Inventory[] = [
		{
			name: "Vorspeisen",
			items: [
				{
					id: 5,
					price: 14.7,
					name: "Vorspeisenteller",
					variations: [],
					pickedVariation: { name: null, preis: null }
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
						{ name: "Pommes", preis: 0 },
						{ name: "Reis", preis: 1 },
						{ name: "Kroketten", preis: 1.5 }
					],
					pickedVariation: { name: null, preis: null }
				}
			]
		},
		{
			name: "Beilagen",
			items: [
				{
					id: 7,
					price: 4.7,
					name: "Pommes",
					variations: [],
					pickedVariation: { name: null, preis: null }
				}
			]
		},
		{
			name: "Dessert",
			items: [
				{
					id: 8,
					price: 6.4,
					name: "Tiramisu",
					variations: [],
					pickedVariation: { name: null, preis: null }
				}
			]
		}
	]

	selectedVariation: Variation[] = this.drinks[0].items[0].variations

	selectedInventory: Item[] = this.drinks[0].items

	bookedItems = new Map<Item, Map<Variation, number>>()

	numberpad: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

	newItems = new Map<Item, Map<Variation, number>>()

	endpreis: number = 0.0

	lastClickedItem: Item | null = null

	lastClickedItemSource: "new" | "booked" | null = null

	console: string = "0.0€"

	selectedItemNew: Item | null = null
	selectedItemBooked: Item | null = null

	isItemPopupVisible: Boolean = false

	consoleActive: Boolean = false

	commaUsed: Boolean = false

	constructor(
		private dataService: DataService,
		private apiService: ApiService
	) {}

	async ngOnInit() {
		if (isServer()) return

		await this.dataService.userPromiseHolder.AwaitResult()

		let listCategoriesResult = await this.apiService.listCategories(
			`
				total
				items {
					name
					products {
						total
						items {
							name
						}
					}
				}
			`
		)

		console.log(listCategoriesResult)
	}

	//Lade Items zur ausgewählten Kategorie
	changeSelectedInventory(items: Item[]) {
		this.selectedInventory = items
	}

	toggleItemPopup() {
		this.isItemPopupVisible = !this.isItemPopupVisible
	}

	clickedItemHandler(itemMap: Map<Item, Map<Variation, number>>, item: Item) {
		if (itemMap.has(item)) {
			let map = itemMap.get(item)
			if (map.has(item.pickedVariation)) {
				let value = map.get(item.pickedVariation)
				map.set(item.pickedVariation, value + 1)
			} else {
				map.set(item.pickedVariation, 1)
			}
		} else {
			itemMap.set(
				item,
				new Map<Variation, number>([[item.pickedVariation, 1]])
			)
		}
		this.showTotal()
	}

	//Füge Item der Liste an neu bestellten Artikeln hinzu
	selectItem(item: Item) {
		if (item.variations.length < 1) {
			this.clickedItemHandler(this.newItems, item)
		} else {
			this.lastClickedItem = item
			this.toggleItemPopup()
		}
	}

	setVariation(pickedVariation: Variation) {
		this.lastClickedItem.pickedVariation = pickedVariation

		this.clickedItemHandler(this.newItems, this.lastClickedItem)
		this.toggleItemPopup()
	}

	//Aktualisiert den Gesamtpreis
	showTotal() {
		var tmpTotal: number = 0

		for (let [key, value] of this.newItems) {
			for (let [variation, number] of value) {
				tmpTotal += (variation.preis + key.price) * number
			}
		}
		for (let [key, value] of this.bookedItems) {
			for (let [variation, number] of value) {
				tmpTotal += (variation.preis + key.price) * number
			}
		}
		this.console = tmpTotal.toFixed(2) + "€"

		this.consoleActive = false
		this.commaUsed = false
	}

	//Speichert das zuletzt angeklickte item in einer Variable
	onCardClick(item: Item, source: "new" | "booked") {
		this.lastClickedItem = item
		this.lastClickedItemSource = source
		if (source === "new") {
			this.selectedItemNew = item
			this.selectedItemBooked = null
		} else if (source === "booked") {
			this.selectedItemBooked = item
			this.selectedItemNew = null
		}
	}

	//Gibt true oder false zurück ob ein item aus new angeklickt wurde
	isSelectedNew(item: Item): boolean {
		return this.selectedItemNew === item
	}

	//Gibt true oder false zurück ob ein item aus booked angeklickt wurde
	isSelectedBooked(item: Item): boolean {
		return this.selectedItemBooked === item
	}

	//Löscht das zuletzt angeklickte item
	deleteItem() {
		if (this.lastClickedItem) {
			if (this.lastClickedItemSource === "new") {
				this.newItems.delete(this.lastClickedItem)
			} else if (this.lastClickedItemSource === "booked") {
				this.bookedItems.delete(this.lastClickedItem)
			}
			this.selectedItemNew = null
			this.selectedItemBooked = null
			this.lastClickedItem = null
			this.lastClickedItemSource = null
			this.showTotal()
		}
	}

	//Fügt Items der Liste an bestellten Artikeln hinzu
	sendOrder() {
		for (let [key, value] of this.newItems) {
			if (this.bookedItems.has(key)) {
				let map = this.bookedItems.get(key)
				for (let [variation, number] of value) {
					if (map.has(variation)) {
						let numberOfBookedVariations = map.get(variation)
						map.set(variation, numberOfBookedVariations + number)
					} else {
						map.set(variation, number)
					}
				}
			} else {
				this.bookedItems.set(key, value)
			}
		}
		this.selectedItemNew = null
		this.selectedItemBooked = null
		this.newItems.clear()
		this.showTotal()
	}

	//Berechnet den Preis der hinzugefügten Items
	calculateTotalPrice(
		itemPrice: number,
		variationPrice: number,
		number: number
	) {
		return ((itemPrice + variationPrice) * number).toFixed(2)
	}

	//Fügt die gedrückte Nummer in die Konsole ein
	consoleInput(input: string) {
		if (this.consoleActive == false) {
			this.consoleActive = true
			this.console = ""
		}
		this.console += input
	}
}
