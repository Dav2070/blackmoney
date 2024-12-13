import { Component, ComponentFactoryResolver } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { AllItemHandler } from "src/app/models/all-item-handler.model"
import { Bill } from "src/app/models/bill.model"
import { Inventory } from "src/app/models/inventory.model"
import { Item } from "src/app/models/item.model"
import { PickedItem } from "src/app/models/picked-item.model"
import { Variation } from "src/app/models/variation.model"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { HardcodeService } from "src/app/services/hardcode-service"
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

	isItemPopupVisible: Boolean = false

	consoleActive: Boolean = false

	commaUsed: Boolean = false
	tableUuid: string = ""
	xUsed: Boolean = false
	minusUsed: Boolean = false

	tmpVariations = new Map<number, Variation>()

	tmpAnzahl = 0

	selectedItem: PickedItem = undefined
	tmpAllItemHandler: AllItemHandler = undefined

	isBillPopupVisible: boolean = false

	bills: Bill[] = []

	pickedBill: Bill = undefined

	constructor(
		private dataService: DataService,
		private apiService: ApiService,
		private activatedRoute: ActivatedRoute,
		private hardCodedService: HardcodeService
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
			if (this.tmpAnzahl > 0) {
				this.stagedItems.pushNewItem(new PickedItem(item, this.tmpAnzahl))
			} else {
				this.stagedItems.pushNewItem(new PickedItem(item, 1))
			}

			this.showTotal()
		}
		//Öffnet Popup für Variationen
		else {
			this.lastClickedItem = item
			this.isItemPopupVisible = true
		}
	}

	//Verringert Item um 1 oder Anzahl in Konsole
	substractitem() {
		if (this.selectedItem.pickedVariation) {
			//Wenn Item Variationen enthält
			this.minusUsed = true
			this.isItemPopupVisible = true
			this.lastClickedItem = this.selectedItem
			this.lastClickedItem.variations = Array.from(
				this.selectedItem.pickedVariation.values()
			)
			this.tmpVariations = new Map<number, Variation>(
				Array.from(this.selectedItem.pickedVariation.entries()).map(
					([id, variation]) => [id, { ...variation }]
				)
			)
		} else {
			if (this.tmpAnzahl > 0) {
				//Wenn zu löschende Anzahl eingegeben wurde (4 X -)
				if (this.selectedItem.anzahl > this.tmpAnzahl) {
					this.selectedItem.anzahl -= this.tmpAnzahl
				} else if (this.selectedItem.anzahl === this.tmpAnzahl) {
					this.tmpAllItemHandler.deleteItem(this.selectedItem)
				} else {
					window.alert("Anzahl ist zu hoch")
				}
				this.showTotal()
			} else {
				//Wenn keine zu löschende Anzahl eingegeben wurde (nur -)
				if (this.selectedItem.anzahl > 1) {
					this.selectedItem.anzahl -= 1
				} else {
					this.tmpAllItemHandler.deleteItem(this.selectedItem)
				}
				this.showTotal()
			}
		}
	}

	//Füge item mit Variation zu stagedItems hinzu
	sendVariation() {
		console.log("sendVariation called")
		let totalVariationAmount = 0
		for (let variation of this.tmpVariations.values()) {
			totalVariationAmount += variation.anzahl
		}

		if (this.minusUsed) {
			// Setze die Anzahl der Variation von dem ausgewählten items in die stagedItems
			for (let variation of this.selectedItem.pickedVariation.values()) {
				if (this.tmpVariations.get(variation.id) === undefined) {
					this.selectedItem.pickedVariation.delete(variation.id)
				} else {
					this.selectedItem.pickedVariation.get(variation.id).anzahl =
						this.tmpVariations.get(variation.id).anzahl
				}
			}
			// Wenn alle Variationen gelöscht wurden, lösche das Item
			if (this.selectedItem.pickedVariation.size === 0) {
				this.tmpAllItemHandler.deleteItem(this.selectedItem)
			} else {
				// Die Summe des Items ist die Summe der Variationen
				this.selectedItem.anzahl = totalVariationAmount
			}

			this.minusUsed = false
		} else {
			const newItem = new PickedItem(
				this.lastClickedItem,
				totalVariationAmount,
				new Map(this.tmpVariations)
			)
			this.stagedItems.pushNewItem(newItem)
		}

		this.lastClickedItem = undefined
		this.tmpVariations.clear()
		this.isItemPopupVisible = false
		this.showTotal()
	}

	checkForMinus(variable: String) {
		if (this.minusUsed) {
			if (variable === "reduce") {
				if (this.tmpAnzahl > 0) {
					let tmpVariationsAnzahl = 0
					for (let variation of this.tmpVariations.values()) {
						tmpVariationsAnzahl += variation.anzahl
					}
					if (
						this.tmpAnzahl ===
						this.selectedItem.anzahl - tmpVariationsAnzahl
					) {
						return true
					}
				}
			}
			if (variable === "increase") {
				let tmpVariationsAnzahl = 0
				for (let variation of this.tmpVariations.values()) {
					tmpVariationsAnzahl += variation.anzahl
				}
				if (tmpVariationsAnzahl >= this.selectedItem.anzahl - 1) {
					return true
				}
			}
		}

		return false
	}

	//Aktualisiert den Gesamtpreis
	showTotal() {
		this.console =
			(
				this.bookedItems.calculatTotal() + this.stagedItems.calculatTotal()
			).toFixed(2) + "€"

		this.consoleActive = false
		this.commaUsed = false
		this.tmpAnzahl = 0
		this.xUsed = false
		this.selectedItem = undefined
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
			this.tmpVariations.set(variation.id, { ...variation, anzahl: 1 })
		}
	}

	returnTmpVariationCount() {
		let total = 0
		for (let variation of this.tmpVariations.values()) {
			total += variation.anzahl
		}
		return total
	}

	//Verringert eine Variation um eins oder entfernt diese
	removeVariation(variation: Variation) {
		if (this.tmpVariations.has(variation.id)) {
			if (this.tmpVariations.get(variation.id).anzahl > 1) {
				this.tmpVariations.get(variation.id).anzahl -= 1
			} else {
				this.tmpVariations.delete(variation.id)
			}
		}
	}

	//Prüft ob am Anfang des Strings eine 0 eingefügt ist
	checkforZero() {
		if (this.consoleActive) {
			if (this.console.charAt(0) === "0") {
				return true
			}
		}
		return false
	}

	//Setze die Anzahl der Items die gebucht werden sollen
	setAnzahl() {
		this.tmpAnzahl = parseInt(this.console)
		this.console += "x"
		//damit andere Buttons gesperrt werden
		this.xUsed = true
	}

	//Checkt ob Limit der Anzahl erreicht ist
	checkLimitAnzahl() {
		if (!this.minusUsed) {
			if (this.tmpAnzahl > 0) {
				let anzahl = 0
				for (let variation of this.tmpVariations.values()) {
					anzahl += variation.anzahl
				}
				if (anzahl === this.tmpAnzahl) {
					return true
				}
			}
		}

		return false
	}

	//Checkt ob mindestens eine Variation ausgewählt wurde oder die Anzahl an Variationen ausgewählt wurde die man buchen möchte
	checkPickedVariation() {
		if (this.minusUsed) {
			if (this.tmpAnzahl > 0) {
				let anzahl = 0
				for (let variation of this.tmpVariations.values()) {
					anzahl += variation.anzahl
				}
				if (anzahl === this.selectedItem.anzahl - this.tmpAnzahl) {
					return false
				}
			} else {
				let anzahl = 0
				for (let variation of this.tmpVariations.values()) {
					anzahl += variation.anzahl
				}
				if (anzahl < this.selectedItem.anzahl) {
					return false
				}
			}
		}
		if (!this.minusUsed) {
			if (this.tmpAnzahl > 0) {
				let anzahl = 0
				for (let variation of this.tmpVariations.values()) {
					anzahl += variation.anzahl
				}
				if (anzahl === this.tmpAnzahl) {
					return false
				}
			} else {
				for (let variation of this.tmpVariations.values()) {
					if (variation.anzahl > 0) {
						return false
					}
				}
			}
		}

		return true
	}

	//Bucht Artikel mit Artikelnummer
	bookById() {
		let pickedItem: Item = undefined
		let id = this.console
		if (this.xUsed) {
			id = this.console.split("x")[1]
		}
		for (let dish of this.dishes) {
			for (let item of dish.items) {
				if (id === item.id.toString()) pickedItem = item
			}
		}
		for (let drink of this.drinks) {
			for (let item of drink.items) {
				if (id === item.id.toString()) pickedItem = item
			}
		}
		if (pickedItem) {
			this.clickItem(pickedItem)
		} else {
			window.alert("Item gibt es nicht")
		}
	}

	//Prüft ob nach dem x eine Nummer einegeben wurde
	checkArticleNumber() {
		if (this.xUsed) {
			if (this.console.split("x")[1]) {
				return false
			}
			return true
		}
		return false
	}

	//Selektiert das Item in der Liste
	selectItem(pickedItem: PickedItem, AllItemHandler: AllItemHandler) {
		this.selectedItem = pickedItem
		this.tmpAllItemHandler = AllItemHandler
	}

	//Füge selektiertes Item hinzu
	addSelectedItem() {
		let pickedItem: Item = undefined
		let id = this.selectedItem.id
		for (let dish of this.dishes) {
			for (let item of dish.items) {
				if (id === item.id) pickedItem = item
			}
		}
		for (let drink of this.drinks) {
			for (let item of drink.items) {
				if (id === item.id) pickedItem = item
			}
		}
		this.clickItem(pickedItem)
	}

	createBill(payment: string) {
		let bill = new Bill(
			"Bediener 1",
			parseInt(this.tableUuid),
			this.bookedItems,
			new Date(),
			payment,
			false
		)
		this.bookedItems.clearItems()
	}

	openBills() {
		this.bills = this.hardCodedService.getBillsOfTable(20)
		this.pickedBill = this.bills[0]
		this.isBillPopupVisible = !this.isBillPopupVisible
	}

	closeBills() {
		this.isBillPopupVisible = !this.isBillPopupVisible
		this.bills = []
		this.pickedBill = undefined
	}
}
