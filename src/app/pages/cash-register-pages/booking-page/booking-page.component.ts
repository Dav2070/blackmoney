import { Component, Inject, PLATFORM_ID } from "@angular/core"
import { isPlatformServer } from "@angular/common"
import { Router, ActivatedRoute } from "@angular/router"
import { AllItemHandler } from "src/app/models/cash-register/all-item-handler.model"
import { Bill } from "src/app/models/cash-register/bill.model"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { HardcodeService } from "src/app/services/hardcode-service"
import { Category } from "src/app/models/Category"
import { Product } from "src/app/models/Product"
import { OrderItem } from "src/app/models/OrderItem"
import { TmpVariations } from "src/app/models/cash-register/tmp-variations.model"
import { Table } from "src/app/models/Table"
import { Room } from "src/app/models/Room"
import {
	convertCategoryResourceToCategory,
	convertOrderItemResourceToOrderItem,
	convertOrderResourceToOrder
} from "src/app/utils"
import { OrderItemVariation } from "src/app/models/OrderItemVariation"
import { count } from "node:console"
import { List, OrderItemVariationResource, PaymentMethod, VariationResource } from "src/app/types"
import { threadId } from "node:worker_threads"
import { VariationItem } from "src/app/models/VariationItem"
import { OrderResource } from "dav-js"
import { Order } from "src/app/models/Order"

interface AddProductsInput {
	uuid: string
	count: number
	variations?: AddProductsInputVariation[]
}

interface AddProductsInputVariation {
	variationItemUuids: string[]
	count: number
}

@Component({
	templateUrl: "./booking-page.component.html",
	styleUrl: "./booking-page.component.scss",
	standalone: false
})
export class BookingPageComponent {
	categories: Category[] = []
	selectedInventory: Product[] = []

	//bookedItems = new Map<Item, Map<Variation, number>>()
	bookedItems = new AllItemHandler()
	stagedItems = new AllItemHandler()
	numberpad: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

	//newItems = new Map<Item, Map<Variation, number>>()

	endpreis: number = 0.0

	lastClickedItem: Product = null

	lastClickedItemSource: "new" | "booked" | null = null

	console: string = "0.00 €"

	selectedItemNew: Product = null

	isItemPopupVisible: boolean = false

	consoleActive: boolean = false

	commaUsed: boolean = false
	room: Room = null
	table: Table = null
	orderUuid: string = ""

	xUsed: boolean = false
	minusUsed: boolean = false

	tmpAnzahl = 0

	selectedItem: OrderItem = null
	tmpSelectedItem: OrderItem = null
	tmpAllItemHandler: AllItemHandler = null

	isBillPopupVisible: boolean = false

	bills: Order[] = []

	pickedBill: Order = null

	tmpCountVariations: number = 0

	tmpPickedVariationResource: Map<number, TmpVariations[]>[] = []

	tmpVariations: OrderItemVariation[] = []

	tmpLastPickedVariation: VariationItem[] = []

	constructor(
		private dataService: DataService,
		private apiService: ApiService,
		private activatedRoute: ActivatedRoute,
		private hardCodedService: HardcodeService,
		private router: Router,
		@Inject(PLATFORM_ID) private platformId: object
	) { }

	async ngOnInit() {
		if (isPlatformServer(this.platformId)) return

		await this.dataService.blackmoneyUserPromiseHolder.AwaitResult()

		await this.loadTable(this.activatedRoute.snapshot.paramMap.get("uuid"))
		await this.loadOrders()

		this.showTotal()

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
							id
							uuid
							name
							price
							variations {
								total
								items {
									uuid
									name
									variationItems {
										total
										items {
											uuid
											name
											additionalCost
										}
									}
								}
							}
						}
					}
				}
			`
		)

		if (listCategoriesResult.errors != null) {
			console.error(listCategoriesResult.errors)
			return
		}

		this.categories = []

		for (let categoryResource of listCategoriesResult.data.listCategories
			.items) {
			this.categories.push(
				convertCategoryResourceToCategory(categoryResource)
			)
		}

		if (this.categories.length > 0) {
			this.selectedInventory = this.categories[0].products
		}
	}

	// Lade Items zur ausgewählten Kategorie
	changeSelectedInventory(items: Product[]) {
		this.selectedInventory = items
	}

	// Zeige Variations-Popup an
	toggleItemPopup() {
		this.isItemPopupVisible = !this.isItemPopupVisible
	}

	closeItemPopup() {
		this.isItemPopupVisible = !this.isItemPopupVisible
		this.tmpPickedVariationResource = []
		this.tmpCountVariations = 0
		if (this.minusUsed === true) {
			this.minusUsed = false
		}
		this.tmpSelectedItem = undefined
		this.showTotal()
	}

	// Füge item zu stagedItems hinzu
	clickItem(product: Product) {
		if (product == null) return

		let newItem: OrderItem = {
			uuid: product.uuid,
			count: 0,
			order: null,
			product,
			orderItemVariations: []
		}

		if (product.variations.length === 0) {
			if (this.tmpAnzahl > 0) {
				if (this.stagedItems.includes(newItem)) {
					let existingItem = this.stagedItems.getItem(newItem.product.id)
					existingItem.count += this.tmpAnzahl
				} else {
					newItem.count = this.tmpAnzahl
					this.stagedItems.pushNewItem(newItem)
				}
			} else if (this.stagedItems.includes(newItem)) {
				let existingItem = this.stagedItems.getItem(newItem.product.id)
				existingItem.count += 1
			} else {
				newItem.count = 1
				this.stagedItems.pushNewItem(newItem)
			}

			this.showTotal()
		} else {
			// Öffnet Popup für Variationen
			this.lastClickedItem = product

			for (let variationItem of this.lastClickedItem.variations[
				this.tmpCountVariations
			].variationItems) {
				this.tmpPickedVariationResource.push(
					new Map<number, TmpVariations[]>().set(0, [
						{
							uuid: variationItem.uuid,
							count: 0,
							max: undefined,
							lastPickedVariation: undefined,
							combination: variationItem.name,
							display: variationItem.name,
							pickedVariation: [variationItem]
						}
					])
				)
			}

			this.isItemPopupVisible = true
		}
	}

	// Verringert Item um 1 oder Anzahl in Konsole
	async subtractitem() {
		if (this.tmpAllItemHandler === this.bookedItems) {
			if (this.selectedItem.orderItemVariations.length <= 0) {
				if (this.tmpAnzahl > 0) {
					if (this.selectedItem.count >= this.tmpAnzahl) {
						this.selectedItem.count -= this.tmpAnzahl
					} else {
						window.alert("Anzahl ist zu hoch")
					}
				} else {
					this.selectedItem.count -= 1
				}

				this.sendOrderItem(this.selectedItem)
				this.removeEmptyItem(this.bookedItems)

				this.showTotal()
			} else {
				// Wenn Variationen vorhanden sind

				this.tmpSelectedItem = JSON.parse(JSON.stringify(this.selectedItem))
				this.minusUsed = true
				this.isItemPopupVisible = true
			}
		} else if (this.selectedItem.orderItemVariations.length > 0) {
			//Wenn Item Variationen enthält
			this.tmpSelectedItem = JSON.parse(JSON.stringify(this.selectedItem))
			this.minusUsed = true
			this.isItemPopupVisible = true
		} else if (this.tmpAnzahl > 0) {
			//Wenn zu löschende Anzahl eingegeben wurde (4 X -)

			if (this.selectedItem.count >= this.tmpAnzahl) {
				this.selectedItem.count -= this.tmpAnzahl
			} else {
				window.alert("Anzahl ist zu hoch")
			}

			this.removeEmptyItem(this.stagedItems)
			this.showTotal()
		} else {
			this.selectedItem.count -= 1
			//Wenn keine zu löschende Anzahl eingegeben wurde (nur -)
			/*
			if (this.selectedItem.count > 1) {
				this.selectedItem.count -= 1
			} else {
				this.tmpAllItemHandler.deleteItem(this.selectedItem)
			}
			*/
			this.removeEmptyItem(this.stagedItems)
			this.showTotal()
		}
	}

	removeVariationSubtraction(variation: OrderItemVariation) {
		this.tmpSelectedItem.count -= 1
		variation.count -= 1
	}

	addVariationSubtraction(variation: OrderItemVariation) {
		this.tmpSelectedItem.count += 1
		variation.count += 1
	}

	sendDeleteVariation(orderItem: OrderItem) {
		this.minusUsed = false
		this.isItemPopupVisible = false
		this.tmpVariations = []
		this.selectedItem.count = this.tmpSelectedItem.count
		this.selectedItem.orderItemVariations = this.tmpSelectedItem.orderItemVariations

		if (this.tmpAllItemHandler === this.bookedItems) {
			this.sendOrderItem(orderItem)
		}

		//console.log(this.tmpSelectedItem)
		this.tmpSelectedItem = undefined
		console.log(this.selectedItem)


		this.removeEmptyItem(this.tmpAllItemHandler)
	}

	removeEmptyItem(itemHandler: AllItemHandler) {
		if (this.selectedItem.count == 0) {
			itemHandler.deleteItem(this.selectedItem)
		} else {
			for (let variation of this.selectedItem.orderItemVariations) {
				if (variation.count == 0) {
					this.selectedItem.orderItemVariations.splice(
						this.selectedItem.orderItemVariations.indexOf(variation),
						1
					)
				}
			}
		}
	}

	//Füge item mit Variation zu stagedItems hinzu
	sendVariation() {
		if (
			this.lastClickedItem.variations[this.tmpCountVariations + 1] !=
			undefined
		) {
			for (let variationMap of this.tmpPickedVariationResource) {
				if (variationMap.get(this.tmpCountVariations)) {
					for (let variation of variationMap.get(
						this.tmpCountVariations
					)) {
						if (variation.count > 0) {
							for (let variationItem of this.lastClickedItem.variations[
								this.tmpCountVariations + 1
							].variationItems) {
								if (variationMap.get(this.tmpCountVariations + 1)) {
									variationMap.get(this.tmpCountVariations + 1).push({
										uuid: variationItem.uuid,
										count: 0,
										max: variation.count,
										lastPickedVariation: variation.pickedVariation,
										combination:
											variation.display + " " + variationItem.name,
										display: variationItem.name,
										pickedVariation: [
											...variation.pickedVariation,
											variationItem
										]
									})
								} else {
									variationMap.set(this.tmpCountVariations + 1, [
										{
											uuid: variationItem.uuid,
											count: 0,
											max: variation.count,
											lastPickedVariation: variation.pickedVariation,
											combination:
												variation.display + " " + variationItem.name,
											display: variationItem.name,
											pickedVariation: [
												...variation.pickedVariation,
												variationItem
											]
										}
									])
								}
							}
						}
					}
				}
			}

			this.tmpCountVariations += 1
		} else {
			let orderItem: OrderItem = {
				uuid: this.lastClickedItem.uuid,
				order: null,
				product: this.lastClickedItem,
				count: 0,
				orderItemVariations: []
			}

			for (let variationMap of this.tmpPickedVariationResource) {
				if (variationMap.get(this.tmpCountVariations)) {
					for (let variation of variationMap.get(
						this.tmpCountVariations
					)) {
						if (variation.count > 0) {
							orderItem.count += variation.count
							orderItem.orderItemVariations.push({
								uuid: variation.uuid,
								count: variation.count,
								variationItems: variation.pickedVariation
							})
						}
					}
				}
			}

			this.stagedItems.pushNewItem(orderItem)
			this.tmpPickedVariationResource = []
			this.tmpCountVariations = 0
			this.isItemPopupVisible = false
			this.tmpLastPickedVariation = []
			this.showTotal()
		}

		//Check ob es noch eine weitere Variation gibt
		/*if (
			this.lastClickedItem.variations.items[this.tmpCountVariations + 1] !=
			undefined
		) {
			for (let variationMap of this.tmpPickedVariationResource) {
				console.log(variationMap)
				let variationArray = variationMap.get(this.tmpCountVariations)
				variationArray = variationMap
					.get(this.tmpCountVariations)
					.filter(variation => variation.count > 0)

				variationMap.set(this.tmpCountVariations, variationArray)

				let newVariations: TmpVariations[] = []

				for (let pickedVariation of variationArray) {
					for (let variationItem of this.lastClickedItem.variations.items[
						this.tmpCountVariations + 1
					].variationItems.items) {
						let tmpArray = pickedVariation.pickedVariation
						tmpArray.push(variationItem)
						newVariations.push({
							count: 0,
							combination:
								pickedVariation.display + " " + variationItem.name,
							display: variationItem.name,
							pickedVariation: tmpArray
						})
					}
				}
				variationMap.set(this.tmpCountVariations + 1, newVariations)
			}
			this.tmpCountVariations += 1
		} else {
			let pickedVariations: PickedVariationResource[] = []

			for (let variationMap of this.tmpPickedVariationResource) {
				let variationArray = variationMap.get(this.tmpCountVariations)
				variationArray = variationMap
					.get(this.tmpCountVariations)
					.filter(variation => variation.count > 0)

				variationMap.set(this.tmpCountVariations, variationArray)

				for (let pickedVariation of variationArray) {
					pickedVariations.push({
						total: pickedVariation.count,
						variations: pickedVariation.pickedVariation
					})
				}
			}

			//TODO create item to add in stageItems

			//console.log(pickedVariations)
		}

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

		*/
	}

	checkForMinus(variable: string) {
		/*if (this.minusUsed) {
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

		return false*/
		return true
	}

	async loadTable(uuid: string) {
		if (uuid == null) return

		for (let room of this.dataService.company.rooms) {
			for (let table of room.tables) {
				if (table.uuid === uuid) {
					this.room = room
					this.table = table
					break
				}
			}

			if (this.table != null) {
				break
			}
		}
	}

	//Aktualisiere Bestellungen aus DB
	async loadOrders() {
		let order = await this.apiService.retrieveTable(
			`
				orders(paid: $paid) {
					total
					items {
						uuid
						totalPrice
						orderItems {
							total
							items {
								uuid
								count
								order {
									uuid
								}
								product {
									id
									uuid
									name
									price
									variations {
								total
								items {
									uuid
									name
									variationItems {
										total
										items {
											uuid
											name
											additionalCost
										}
									}
								}
							}
								}
								orderItemVariations {
									total
									items {
										uuid
										count
										variationItems {
											total
											items {
												id
												name
												additionalCost
											}
										}
									}
								}
							}
						}
					}
				}
			`,
			{
				uuid: this.table.uuid,
				paid: false
			}
		)

		if (order.data.retrieveTable.orders.total > 0) {
			if (this.orderUuid === "") {
				this.orderUuid = order.data.retrieveTable.orders.items[0].uuid
			}
			this.bookedItems.clearItems()
			for (let item of order.data.retrieveTable.orders.items[0].orderItems
				.items) {
				this.bookedItems.pushNewItem(
					convertOrderItemResourceToOrderItem(item)
				)
			}
		}
	}

	// Aktualisiert den Gesamtpreis
	async showTotal() {
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
		this.selectedItem = null
	}

	// Fügt Items der Liste an bestellten Artikeln hinzu
	async sendOrder() {
		//this.bookedItems.transferAllItems(this.stagedItems)
		let tmpProductArray: AddProductsInput[] = []

		for (let values of this.stagedItems.getAllPickedItems().values()) {
			let product: AddProductsInput = {
				uuid: values.uuid,
				count: values.count,
				variations: []
			}

			for (let orderItemVariation of values.orderItemVariations) {
				let variation: AddProductsInputVariation = {
					count: orderItemVariation.count,
					variationItemUuids: []
				}

				for (let variationItem of orderItemVariation.variationItems) {
					variation.variationItemUuids.push(variationItem.uuid)
				}

				product.variations.push(variation)
			}

			tmpProductArray.push(product)
		}

		let items = await this.apiService.addProductsToOrder(
			`
				orderItems {
					total
					items {
						uuid
						count
						order {
							uuid
						}
						product {
							id
							uuid
							name
							price
							variations {
								total
								items {
									uuid
									name
									variationItems {
										total
										items {
											uuid
											name
											additionalCost
										}
									}
								}
							}
						}
						orderItemVariations {
							total
							items {
								uuid
								count
								variationItems {
									total
									items {
										uuid
										name
										additionalCost
									}
								}
							}
						}
					}
				}
			`,
			{
				uuid: this.orderUuid,
				products: tmpProductArray
			}
		)

		this.bookedItems.clearItems()


		for (let item of items.data.addProductsToOrder.orderItems.items) {
			this.bookedItems.pushNewItem(convertOrderItemResourceToOrderItem(item))
		}

		this.stagedItems.clearItems()

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
	addVariation(variationItem: TmpVariations) {
		//this.tmpPickedVariationResource.push({total:1,variations:[variationItem]})
		variationItem.count += 1
	}

	returnTmpVariationCount() {
		/*let total = 0
		for (let variation of this.tmpVariations.values()) {
			total += variation.count
		}
		return total*/
	}

	//Verringert eine Variation um eins oder entfernt diese
	removeVariation(variation: TmpVariations) {
		if (variation.count > 0) {
			variation.count -= 1
		}
		/*if (this.tmpVariations.has(variation.uuid)) {
			if (this.tmpVariations.get(variation.uuid).count > 1) {
				this.tmpVariations.get(variation.uuid).count -= 1
			} else {
				this.tmpVariations.delete(variation.uuid)
			}
		}*/
	}

	async sendOrderItem(orderItem: OrderItem) {
		const orderItemVariations: { uuid: string; count: number }[] = []

		for (let variation of orderItem.orderItemVariations) {
			orderItemVariations.push({
				uuid: variation.uuid,
				count: variation.count
			})
		}

		await this.apiService.updateOrderItem(`uuid`, {
			uuid: orderItem.uuid,
			count: orderItem.count,
			orderItemVariations
		})

		this.showTotal()
	}

	//Prüft ob am Anfang des Strings eine 0 eingefügt ist
	checkforZero() {
		return this.consoleActive && this.console.charAt(0) === "0"
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
		/*if (!this.minusUsed) {
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

		return false*/
		return true
	}

	//Checkt ob mindestens eine Variation ausgewählt wurde oder die Anzahl an Variationen ausgewählt wurde die man buchen möchte
	checkPickedVariation() {
		/*if (this.minusUsed) {
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
		*/
		return true
	}

	//Bucht Artikel mit Artikelnummer
	bookById() {

		let pickedItem: Product = undefined
		let id = this.console

		if (this.xUsed) {
			id = this.console.split("x")[1]
		}

		for (let dish of this.categories) {
			for (let item of dish.products) {
				if (id === item.id.toString()) pickedItem = item
			}
		}
		if (pickedItem) {
			this.clickItem(pickedItem)
		} else {
			window.alert("Item gibt es nicht")
		}

	}

	// Prüft ob nach dem x eine Nummer eingeben wurde
	checkArticleNumber() {
		return this.xUsed && !this.console.split("x")[1]
	}

	//Selektiert das Item in der Liste
	selectItem(pickedItem: OrderItem, AllItemHandler: AllItemHandler) {
		this.selectedItem = pickedItem
		this.tmpAllItemHandler = AllItemHandler
	}

	//Füge selektiertes Item hinzu
	addSelectedItem(orderItem: OrderItem) {
		this.clickItem(orderItem.product)
	}

	async createBill(payment: PaymentMethod) {
		await this.apiService.completeOrder("uuid", { uuid: this.orderUuid, paymentMethod: payment })
		window.location.reload()
	}

	async openBills() {
		let listOrdersResult = await this.apiService.listOrders(
			`
				items {
					uuid
					totalPrice
					paymentMethod
					paidAt
					table {
						name
					}
					orderItems {
						items{
							uuid
							count
							product {
								id
								name
								price
							}
							orderItemVariations {
								total
								items {
									uuid
									count
									variationItems {
										total
										items {
											uuid
											name
											additionalCost
										}
									}
								}
							}
						}
					}
				}
			`, { completed: true })
		this.bills = []

		for (let orderResource of listOrdersResult.data.listOrders.items) {
			this.bills.push(
				convertOrderResourceToOrder(orderResource)
			)
		}
		console.log(this.bills)
		this.pickedBill = this.bills[0]

		this.isBillPopupVisible = !this.isBillPopupVisible
	}
	
	closeBills() {
		this.isBillPopupVisible = !this.isBillPopupVisible
		this.bills = []
		this.pickedBill = null
	}

	navigateToTransferPage() {
		let selectedTableNumber = Number(this.console)
		if (isNaN(selectedTableNumber)) return

		// Find the table
		let table = this.room.tables.find(t => t.name == selectedTableNumber)
		if (table == null) return

		// Navigate to the transfer page with the table UUID
		this.router.navigate(["tables", this.table.uuid, table.uuid])
	}

	checkForPlus(variation: OrderItemVariation) {
		let variationCount = this.selectedItem.orderItemVariations.find(
			v =>
				v.variationItems.length === variation.variationItems.length &&
				v.variationItems.every(
					(item, index) =>
						item.name === variation.variationItems[index].name
					//&&
					//item.uuid === variation.variationItems[index].uuid
				)
		)?.count

		if (variationCount <= variation.count) {
			return true
		}
		return false
	}

	calculateTotalPriceOfOrderItem(orderItem: OrderItem) {
		let total = 0


		for (let variation of orderItem.orderItemVariations) {
			for (let variationItem of variation.variationItems) {
				total += variation.count * variationItem.additionalCost
			}
		}

		return ((total + orderItem.product.price * orderItem.count) / 100).toFixed(2)
	}

	checkForPlusaddVariation(variation: TmpVariations) {
		let count = variation.count

		for (let variationMap of this.tmpPickedVariationResource) {
			if (variationMap.get(this.tmpCountVariations)) {
				for (let tmpVariation of
					variationMap.get(this.tmpCountVariations).values()) {
					if (variation.lastPickedVariation == tmpVariation.lastPickedVariation)
						count += tmpVariation.count
				}
			}
		}

		if (count == variation.max && variation.count == 0) {
			return true
		}

		return count > variation.max

	}

	displayVariation(variation: TmpVariations) {
		let variationString = ""


		if (variation.lastPickedVariation != this.tmpLastPickedVariation) {
			this.tmpLastPickedVariation = variation.lastPickedVariation
			for (let variation of this.tmpLastPickedVariation) {
				variationString += variation.name + ""
			}
		}
		if (variationString != "") {
			return variationString
		}
		return null;


	}

	checkForSendVariation() {
		let count = 0
		let maxCount = 0
		let countVariations: TmpVariations[] = []

		for (let variationMap of this.tmpPickedVariationResource) {
			if (variationMap.get(this.tmpCountVariations)) {
				for (let tmpVariation of variationMap.get(this.tmpCountVariations).values()) {
					count += tmpVariation.count
					// Prüfen, ob bereits ein Eintrag mit der gleichen lastPickedVariation existiert
					const exists = countVariations.some(
						v => v.lastPickedVariation === tmpVariation.lastPickedVariation
					);

					if (!exists) {
						countVariations.push(tmpVariation);
					}
				}
			}
		}

		for (let variation of countVariations) {
			maxCount += variation.max
		}

		if (this.tmpCountVariations == 0) {
			return count == 0
		}



		return count != maxCount

	}

	calculateBillTotal(bill: Order): string {
		let total = 0;
		
		for (const item of bill.orderItems) {
			total += item.product.price * item.count;
			
			for (const variation of item.orderItemVariations) {
			for (const variationItem of variation.variationItems) {
				total += variation.count * variationItem.additionalCost;
			}
			}
		}

		return (total / 100).toFixed(2);
	}

}
