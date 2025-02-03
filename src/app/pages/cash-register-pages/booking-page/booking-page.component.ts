import { Component } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { AllItemHandler } from "src/app/models/cash-register/all-item-handler.model"
import { Bill } from "src/app/models/cash-register/bill.model"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { HardcodeService } from "src/app/services/hardcode-service"
import { isServer } from "src/app/utils"
import {
	CategoryResource,
	ProductResource,
	VariationResource
} from "src/app/types"

@Component({
	templateUrl: "./booking-page.component.html",
	styleUrl: "./booking-page.component.scss",
	standalone: false
})
export class BookingPageComponent {
	categories: CategoryResource[] = []
	selectedInventory: ProductResource[] = []

	//bookedItems = new Map<Item, Map<Variation, number>>()
	bookedItems = new AllItemHandler()
	stagedItems = new AllItemHandler()
	numberpad: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

	//newItems = new Map<Item, Map<Variation, number>>()

	endpreis: number = 0.0

	lastClickedItem: ProductResource = null

	lastClickedItemSource: "new" | "booked" | null = null

	console: string = "0.00 €"

	selectedItemNew: ProductResource = null

	isItemPopupVisible: Boolean = false

	consoleActive: Boolean = false

	commaUsed: Boolean = false
	tableUuid: string = ""
	orderUuid: string = ""

	xUsed: Boolean = false
	minusUsed: Boolean = false

	tmpVariations = new Map<string, VariationResource>()

	tmpAnzahl = 0

	selectedItem: ProductResource = undefined
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

		let order = await this.apiService.retrieveTable(
			`
				orders(paid: $paid) {
					total
					items {
						uuid
						totalPrice
						products {
							total
							items {
								uuid
								count
								name
								price
							}
						}
					}
				}
			`,
			{
				uuid: this.tableUuid,
				paid: false
			}
		)

		if (order.data.retrieveTable.orders.total > 0) {
			this.orderUuid = order.data.retrieveTable.orders.items[0].uuid
		}

		let listCategoriesResult = await this.apiService.listCategories(
			`
				total
				items {
					uuid
					name
					type
					products {
						total
						items {
							uuid
							name
							price
						}
					}
				}
			`
		)

		this.categories = []

		for (let item of listCategoriesResult.data.listCategories.items) {
			let category: CategoryResource = {
				uuid: item.uuid,
				name: item.name,
				type: item.type,
				products: {
					total: item.products.total,
					items: item.products.items.map(product => {
						return {
							uuid: product.uuid,
							count: 0,
							name: product.name,
							price: product.price,
							variations: {
								total: 0,
								items: [] as VariationResource[]
							}
						}
					})
				}
			}

			this.categories.push(category)
		}

		if (this.categories.length > 0) {
			this.selectedInventory = this.categories[0].products.items
		}
	}

	//Lade Items zur ausgewählten Kategorie
	changeSelectedInventory(items: ProductResource[]) {
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
	clickItem(product: ProductResource) {
		if (product.variations?.items.length === 0) {
			if (this.tmpAnzahl > 0) {
				//this.stagedItems.pushNewItem(new PickedItem(item, this.tmpAnzahl))
				product.count = this.tmpAnzahl
				this.stagedItems.pushNewItem(product)
			} else {
				product.count = 1
				this.stagedItems.pushNewItem(product)
			}

			this.showTotal()
		} else {
			// Öffnet Popup für Variationen
			this.lastClickedItem = product
			this.isItemPopupVisible = true
		}
	}

	//Verringert Item um 1 oder Anzahl in Konsole
	substractitem() {
		 if (this.selectedItem.variations.total > 0) {
		 	//Wenn Item Variationen enthält
			this.minusUsed = true
		 	this.isItemPopupVisible = true
		 	this.lastClickedItem = this.selectedItem
		 	this.lastClickedItem.variations = {
		 		total: 0,
		 		items: Array.from(this.selectedItem.variations.items)
		 	}
		 	this.tmpVariations = new Map<string, VariationResource>(
		 	)
		 } else {
		 	if (this.tmpAnzahl > 0) {
		 		//Wenn zu löschende Anzahl eingegeben wurde (4 X -)
		 		if (this.selectedItem.count > this.tmpAnzahl) {
		 			this.selectedItem.count -= this.tmpAnzahl
		 		} else if (this.selectedItem.count === this.tmpAnzahl) {
		 			this.tmpAllItemHandler.deleteItem(this.selectedItem)
		 		} else {
					window.alert("Anzahl ist zu hoch")
		 		}
		 		this.showTotal()
		 	} else {
		 		//Wenn keine zu löschende Anzahl eingegeben wurde (nur -)
		 		if (this.selectedItem.count > 1) {
		 			this.selectedItem.count -= 1
		 		} else {
		 			this.tmpAllItemHandler.deleteItem(this.selectedItem)
		 		}
		 		this.showTotal()
		 	}
		 }
	}

	//Füge item mit Variation zu stagedItems hinzu
	sendVariation() {
		// console.log("sendVariation called")
		// let totalVariationAmount = 0
		// for (let variation of this.tmpVariations.values()) {
		// 	totalVariationAmount += variation.anzahl
		// }
		// if (this.minusUsed) {
		// 	// Setze die Anzahl der Variation von dem ausgewählten items in die stagedItems
		// 	for (let variation of this.selectedItem.pickedVariation.values()) {
		// 		if (this.tmpVariations.get(variation.id) === undefined) {
		// 			this.selectedItem.pickedVariation.delete(variation.id)
		// 		} else {
		// 			this.selectedItem.pickedVariation.get(variation.id).anzahl =
		// 				this.tmpVariations.get(variation.id).anzahl
		// 		}
		// 	}
		// 	// Wenn alle Variationen gelöscht wurden, lösche das Item
		// 	if (this.selectedItem.pickedVariation.size === 0) {
		// 		this.tmpAllItemHandler.deleteItem(this.selectedItem)
		// 	} else {
		// 		// Die Summe des Items ist die Summe der Variationen
		// 		this.selectedItem.anzahl = totalVariationAmount
		// 	}
		// 	this.minusUsed = false
		// } else {
		// 	const newItem = new PickedItem(
		// 		this.lastClickedItem,
		// 		totalVariationAmount,
		// 		new Map(this.tmpVariations)
		// 	)
		// 	this.stagedItems.pushNewItem(newItem)
		// }
		// this.lastClickedItem = undefined
		// this.tmpVariations.clear()
		// this.isItemPopupVisible = false
		// this.showTotal()
	}

	checkForMinus(variable: string) {
		if (this.minusUsed) {
			if (variable === "reduce") {
				if (this.tmpAnzahl > 0) {
					let tmpVariationsAnzahl = 0
					for (let variation of this.tmpVariations.values()) {
						tmpVariationsAnzahl += variation.count
					}
					if (
						this.tmpAnzahl ===
						this.selectedItem.count - tmpVariationsAnzahl
					) {
						return true
					}
				}
			}
			if (variable === "increase") {
				let tmpVariationsAnzahl = 0
				for (let variation of this.tmpVariations.values()) {
					tmpVariationsAnzahl += variation.count
				}
				if (tmpVariationsAnzahl >= this.selectedItem.count - 1) {
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
				(this.bookedItems.calculateTotal() +
					this.stagedItems.calculateTotal()) /
				100
			).toFixed(2) + " €"

		this.consoleActive = false
		this.commaUsed = false
		this.tmpAnzahl = 0
		this.xUsed = false
		this.selectedItem = undefined
	}

	//Fügt Items der Liste an bestellten Artikeln hinzu
	sendOrder() {
		//this.bookedItems.transferAllItems(this.stagedItems)
		let tmpProductArray = []

		for (let values of this.stagedItems.getAllPickedItems().values()) {
			tmpProductArray.push({ uuid: values.uuid, count: values.count })
		}

		this.apiService.addProductsToOrder("uuid", {
			uuid: this.orderUuid,
			products: tmpProductArray
		})

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
	addVariation(variation: VariationResource) {
		if (this.tmpVariations.has(variation.uuid)) {
			this.tmpVariations.get(variation.uuid).count += 1
		} else {
			this.tmpVariations.set(variation.uuid, variation)
		}
	}

	returnTmpVariationCount() {
		let total = 0
		for (let variation of this.tmpVariations.values()) {
			total += variation.count
		}
		return total
	}

	//Verringert eine Variation um eins oder entfernt diese
	removeVariation(variation: VariationResource) {
		if (this.tmpVariations.has(variation.uuid)) {
			if (this.tmpVariations.get(variation.uuid).count > 1) {
				this.tmpVariations.get(variation.uuid).count -= 1
			} else {
				this.tmpVariations.delete(variation.uuid)
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
					anzahl += variation.count
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
					anzahl += variation.count
				}
				if (anzahl === this.selectedItem.count - this.tmpAnzahl) {
					return false
				}
			} else {
				let anzahl = 0
				for (let variation of this.tmpVariations.values()) {
					anzahl += variation.count
				}
				if (anzahl < this.selectedItem.count) {
					return false
				}
			}
		}
		if (!this.minusUsed) {
			if (this.tmpAnzahl > 0) {
				let anzahl = 0
				for (let variation of this.tmpVariations.values()) {
					anzahl += variation.count
				}
				if (anzahl === this.tmpAnzahl) {
					return false
				}
			} else {
				for (let variation of this.tmpVariations.values()) {
					if (variation.count > 0) {
						return false
					}
				}
			}
		}

		return true
	}

	//Bucht Artikel mit Artikelnummer
	bookById() {
		/*
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
		*/
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
	selectItem(pickedItem: ProductResource, AllItemHandler: AllItemHandler) {
		this.selectedItem = pickedItem
		this.tmpAllItemHandler = AllItemHandler
	}

	//Füge selektiertes Item hinzu
	addSelectedItem() {
		let pickedItem: ProductResource = undefined
		let id = this.selectedItem.uuid
		for (let dish of this.categories) {
			for (let item of dish.products.items) {
				if (id === item.uuid) pickedItem = item
			}
		}
		for (let drink of this.categories) {
			for (let item of drink.products.items) {	
				if (id === item.uuid) pickedItem = item
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
