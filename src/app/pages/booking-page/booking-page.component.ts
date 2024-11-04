import { Component } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { AllItemHandler } from "src/app/models/all-item-handler.model"
import { Inventory } from "src/app/models/inventory.model"
import { Item } from "src/app/models/item.model"
import { PickedItem } from "src/app/models/picked-item.model"
import { Variation } from "src/app/models/variation.model"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { isServer } from "src/app/utils"

@Component({
	templateUrl: "./booking-page.component.html",
	styleUrl: "./booking-page.component.scss"
})
export class BookingPageComponent {
	date: String = new Date().toLocaleString("de-DE")
	bediener: String = "Bediener 1"
	drinks: Inventory[] = [
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
	dishes: Inventory[] = [
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

	//selectedVariation: Variation[] = this.drinks[0].items[0].variations

	selectedInventory: Item[] = this.drinks[0].items

	//bookedItems = new Map<Item, Map<Variation, number>>()
	bookedItems = new AllItemHandler()
	stagedItems = new AllItemHandler()
	numberpad: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

	//newItems = new Map<Item, Map<Variation, number>>()

	endpreis: number = 0.0

	lastClickedItem: Item | null = null

	lastClickedItemSource: "new" | "booked" | null = null

	console: string = "0.0€"

	selectedItemNew: Item | null = null
	selectedItemBooked: Item | null = null

	isItemPopupVisible: Boolean = false

	consoleActive: Boolean = false

	commaUsed: Boolean = false
	tableUuid: string = ""

	tmpVariations = new Map<number, Variation>()

	constructor(
		private dataService: DataService,
		private apiService: ApiService,
		private activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		if (isServer()) return

		await this.dataService.userPromiseHolder.AwaitResult()
		this.tableUuid = this.activatedRoute.snapshot.paramMap.get("uuid")

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

	//Zeige Variations-Popup an
	toggleItemPopup() {
		this.isItemPopupVisible = !this.isItemPopupVisible
	}

	closeItemPopup() {
		this.isItemPopupVisible = !this.isItemPopupVisible
		this.tmpVariations.clear()
	}

	//Füge item zu stagedItems hinzu
	clickItem(item: Item) {
		if (item.variations == undefined) {
			this.stagedItems.pushNewItem(new PickedItem(item, 1))
			this.showTotal()
		} else {
			this.lastClickedItem = item
			this.isItemPopupVisible = true
		}
	}

	//Füge item mit Variation zu stagedItems hinzu
	sendVariation() {
		let number = 0
		let variations = []
		for (let variation of this.tmpVariations.values()) {
			number += variation.anzahl
			variations.push(variation)
		}
		this.stagedItems.pushNewItem(
			new PickedItem(this.lastClickedItem, number, variations)
		)
		this.lastClickedItem = undefined
		this.tmpVariations.clear()
		this.isItemPopupVisible = false
		this.showTotal()
	}

	//Aktualisiert den Gesamtpreis
	showTotal() {
		this.console =
			(
				this.bookedItems.calculatTotal() + this.stagedItems.calculatTotal()
			).toFixed(2) + "€"

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
		/*if (this.lastClickedItem) {
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
		}*/
	}

	//Fügt Items der Liste an bestellten Artikeln hinzu
	sendOrder() {
		this.bookedItems.transferAllItems(this.stagedItems)
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

	//Erhöht eine Variation um eins
	addVariation(variation: Variation) {
		if (this.tmpVariations.has(variation.id)) {
			this.tmpVariations.get(variation.id).anzahl += 1
		} else {
			variation.anzahl = 1
			this.tmpVariations.set(variation.id, variation)
		}
	}

	//Verringert eine Variation um eins oder entfernt diese
	removeVariation(variation: Variation) {
		if (this.tmpVariations.get(variation.id).anzahl === 1) {
			this.tmpVariations.delete(variation.id)
		} else {
			this.tmpVariations.get(variation.id).anzahl -= 1
		}
	}
}
