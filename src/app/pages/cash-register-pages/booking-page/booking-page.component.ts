import { Component, Inject, PLATFORM_ID, ViewChild } from "@angular/core"
import { isPlatformServer } from "@angular/common"
import { Router, ActivatedRoute } from "@angular/router"
import { faArrowRightArrowLeft } from "@fortawesome/pro-regular-svg-icons"
import { AllItemHandler } from "src/app/models/cash-register/all-item-handler.model"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { Category } from "src/app/models/Category"
import { Product } from "src/app/models/Product"
import { OrderItem } from "src/app/models/OrderItem"
import { TmpVariations } from "src/app/models/cash-register/tmp-variations.model"
import { Table } from "src/app/models/Table"
import { Room } from "src/app/models/Room"
import { VariationItem } from "src/app/models/VariationItem"
import { Order } from "src/app/models/Order"
import { Offer } from "src/app/models/Offer"
import { OfferItem } from "src/app/models/OfferItem"
import { OfferOrderItem } from "src/app/models/OfferOrderItem"
import { OrderItemVariation } from "src/app/models/OrderItemVariation"
import { SelectTableDialogComponent } from "src/app/dialogs/select-table-dialog/select-table-dialog.component"
import {
	convertCategoryResourceToCategory,
	convertOfferResourceToOffer,
	convertOrderItemResourceToOrderItem,
	convertOrderResourceToOrder
} from "src/app/utils"
import { PaymentMethod } from "src/app/types"

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
	locale = this.localizationService.locale.bookingPage
	faArrowRightArrowLeft = faArrowRightArrowLeft
	categories: Category[] = []
	selectedInventory: Product[] = []
	selectedCategory: string = ""

	menues: Offer[] = []
	specials: Offer[] = []
	isMenuePopupVisible: boolean = false
	specialCategories: Category[] = []
	specialProducts: Product[] = []
	currentSpecial: Offer | null = null
	currentMenu: Offer | null = null
	currentMaxSelections: number = 0
	currentIndex: number = 0
	tmpSpecialSelectedItems: OrderItem[] = []
	tmpSpecialAllItemsHandler = new AllItemHandler()
	selectedMenuItem: OfferOrderItem = null
	lastClickedMenuItem: OfferOrderItem = null

	bookedItems = new AllItemHandler()
	stagedItems = new AllItemHandler()
	numberpad: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

	endpreis: number = 0.0

	lastClickedItem: Product = null

	lastClickedItemSource: "new" | "booked" | null = null

	console: string = "0.00 €"

	selectedItemNew: Product = null

	isItemPopupVisible: boolean = false
	isSpecialVariationPopupVisible: boolean = false
	isSpecialVariationMode: boolean = false

	consoleActive: boolean = false

	commaUsed: boolean = false
	room: Room = null
	table: Table = null
	orderUuid: string = null
	billUuid: string = null

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

	//#region SelectTableDialog
	@ViewChild("selectTableDialog")
	selectTableDialog: SelectTableDialogComponent
	//#endregion

	constructor(
		public dataService: DataService,
		private apiService: ApiService,
		private activatedRoute: ActivatedRoute,
		private localizationService: LocalizationService,
		private router: Router,
		@Inject(PLATFORM_ID) private platformId: object
	) {}

	async ngOnInit() {
		if (isPlatformServer(this.platformId)) return

		await this.dataService.blackmoneyUserPromiseHolder.AwaitResult()
		await this.dataService.restaurantPromiseHolder.AwaitResult()

		await this.loadTable(this.activatedRoute.snapshot.paramMap.get("uuid"))
		await this.loadOrders()

		this.showTotal()

		let retrieveRestaurantResponse = await this.apiService.retrieveRestaurant(
			`
				menu {
					categories {
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
					}
					offers {
						items {
							uuid
							name
							offerType
							discountType
							offerValue
							startDate
							endDate
							startTime
							endTime
							weekdays
							offerItems {
								total
								items {
									uuid
									name
									maxSelections
								}
							}
						}
					}
				}
			`,
			{ uuid: this.dataService.restaurant.uuid }
		)

		if (retrieveRestaurantResponse.errors != null) {
			console.error(retrieveRestaurantResponse.errors)
			return
		}

		const retrieveRestaurantResponseData =
			retrieveRestaurantResponse.data.retrieveRestaurant
		const categories = retrieveRestaurantResponseData.menu.categories.items
		const offers = retrieveRestaurantResponseData.menu.offers.items
		if (categories == null || offers == null) return

		this.categories = []
		this.menues = []
		this.specials = []

		for (const categoryResource of categories) {
			this.categories.push(
				convertCategoryResourceToCategory(categoryResource)
			)
		}

		if (this.categories.length > 0) {
			this.selectedCategory = this.categories[0].uuid
			this.selectedInventory = this.categories[0].products
		}

		for (const offerResource of offers) {
			const offer = convertOfferResourceToOffer(offerResource)
			if (offer.offerItems.length === 0) continue

			if (offer.offerItems.length === 1) {
				this.specials.push(offer)
			} else {
				this.menues.push(offer)
			}
		}
	}

	// Lade Items zur ausgewählten Kategorie
	selectCategory(category: Category) {
		this.selectedCategory = category.uuid
		this.selectedInventory = category.products
	}

	showMenus() {
		this.selectedCategory = "menues"
		this.selectedInventory = []
	}

	showSpecials() {
		this.selectedCategory = "specials"
		this.selectedInventory = []
	}

	selectTableButtonClick() {
		this.selectTableDialog.show()
	}

	selectTableDialogPrimaryButtonClick(event: { uuid: string }) {
		this.selectTableDialog.hide()
		this.router.navigate(["dashboard", "tables", event.uuid])
	}

	// Zeige Variations-Popup an
	toggleItemPopup() {
		this.isItemPopupVisible = !this.isItemPopupVisible
	}

	closeItemPopup() {
		this.isItemPopupVisible = !this.isItemPopupVisible
		this.tmpPickedVariationResource = []
		this.tmpCountVariations = 0
		this.isSpecialVariationMode = false
		if (this.minusUsed === true) {
			this.minusUsed = false
		}
		this.tmpSelectedItem = undefined
		this.showTotal()
	}

	closeSpecialVariationPopup() {
		this.isSpecialVariationPopupVisible = false
		this.tmpPickedVariationResource = []
		this.tmpCountVariations = 0
		this.isSpecialVariationMode = false
		this.tmpSelectedItem = undefined
		this.selectedItem = null
		this.lastClickedItem = null
		this.lastClickedMenuItem = null
		this.tmpAllItemHandler = null

		if (this.minusUsed) {
			this.minusUsed = false
		}
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

	clickMenuItem(menuItem: OfferOrderItem) {
		let newItem: OfferOrderItem = {
			uuid: menuItem.uuid,
			count: 0,
			order: null,
			offer: menuItem.offer,
			product: menuItem.product,
			orderItems: []
		}

		//Wenn das Menü nur ein Produkt enthält
		if (
			menuItem.orderItems.length === 1 &&
			menuItem.orderItems[0].orderItemVariations.length === 1
		) {
			if (this.tmpAnzahl > 0) {
				//Menu exisitiert bereits in stagedItems
				if (this.stagedItems.includesOfferItem(menuItem)) {
					let existingItem = this.stagedItems.getOfferItem(
						newItem.product.id,
						newItem.offer.uuid
					)
					existingItem.count += this.tmpAnzahl
					existingItem.orderItems[0].count += this.tmpAnzahl
					existingItem.orderItems[0].orderItemVariations[0].count +=
						this.tmpAnzahl
				} else {
					//Menu existiert nicht in stagedItems
					newItem.count = this.tmpAnzahl
					this.stagedItems.pushNewMenuItem(newItem)
				}
			} else if (this.stagedItems.includesOfferItem(menuItem)) {
				let existingItem = this.stagedItems.getOfferItem(
					newItem.product.id,
					newItem.offer.uuid
				)
				existingItem.count += 1
				existingItem.orderItems[0].count += 1
				existingItem.orderItems[0].orderItemVariations[0].count += 1
			}
			this.showTotal()
		} else {
			if (this.selectedMenuItem.offer.offerItems.length > 1) {
				this.selectedMenuItem.count += 1
				for (let item of this.selectedMenuItem.orderItems) {
					console.log("OrderItem: ", item)
					// Finde die entsprechende maxSelections für dieses Produkt
					let maxSelectionsForThisItem = 0
					for (let offerItem of this.selectedMenuItem.offer.offerItems) {
						for (let product of offerItem.products) {
							if (product.uuid === item.uuid) {
								maxSelectionsForThisItem = offerItem.maxSelections
								console.log("Product: ", product)
								console.log("maxSelections: ", offerItem.maxSelections)
								break
							}
						}
						if (maxSelectionsForThisItem > 0) break
					}

					item.count += maxSelectionsForThisItem
					for (let variation of item.orderItemVariations) {
						variation.count += 1
					}
				}
			}
			// Öffnet Popup für Variationen
			this.lastClickedItem = menuItem.orderItems[0].product
			this.lastClickedMenuItem = menuItem

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

			this.isSpecialVariationPopupVisible = true // Separate Variable für Special-Popup
			this.isSpecialVariationMode = true // Flag für Special-Modus
		}
		// Zeige das Gesamt
		this.showTotal()
	}

	// Verringert Item um 1 oder Anzahl in Konsole
	async subtractitem() {
		// Prüfe ob ein MenuItem ausgewählt ist
		if (this.selectedMenuItem != null) {
			if (this.tmpAllItemHandler === this.bookedItems) {
				// Booked MenuItems
				if (this.tmpAnzahl > 0) {
					if (this.selectedMenuItem.count > this.tmpAnzahl) {
						this.selectedMenuItem.orderItems[0].count -= this.tmpAnzahl
						this.selectedMenuItem.orderItems[0].orderItemVariations[0].count -=
							this.tmpAnzahl
					} else if (this.selectedMenuItem.count === this.tmpAnzahl) {
						this.stagedItems.deleteMenuItem(this.selectedMenuItem)
					} else {
						window.alert("Anzahl ist zu hoch")
					}
				} else {
					this.selectedMenuItem.count -= 1
					if (this.selectedMenuItem.orderItems.length > 0) {
						this.selectedMenuItem.orderItems[0].count -= 1
						if (
							this.selectedMenuItem.orderItems[0].orderItemVariations
								.length > 0
						) {
							this.selectedMenuItem.orderItems[0].orderItemVariations[0].count -= 1
						}
					}
				}

				this.removeEmptyMenuItem(this.bookedItems)
				this.showTotal()
			} else {
				// Für staged MenuItems mit einem Produkt
				if (
					this.selectedMenuItem.orderItems.length === 1 &&
					this.selectedMenuItem.orderItems[0].orderItemVariations
						.length === 1
				) {
					if (this.tmpAnzahl > 0) {
						if (this.selectedMenuItem.count >= this.tmpAnzahl) {
							this.selectedMenuItem.count -= this.tmpAnzahl
							this.selectedMenuItem.orderItems[0].count -= this.tmpAnzahl
							this.selectedMenuItem.orderItems[0].orderItemVariations[0].count -=
								this.tmpAnzahl
						} else {
							window.alert("Anzahl ist zu hoch")
						}
					} else {
						// Normal Minus
						if (this.selectedMenuItem.count > 0) {
							this.selectedMenuItem.count -= 1
							this.selectedMenuItem.orderItems[0].count -= 1
							this.selectedMenuItem.orderItems[0].orderItemVariations[0].count -= 1
						}
						this.removeEmptyMenuItem(this.stagedItems)
					}
				} else {
					// Menüs
					if (this.selectedMenuItem.offer.offerItems.length > 1) {
						this.selectedMenuItem.count -= 1
					} else {
						// Mehrere Produkte im Special - lade alle Produkte mit ihren Variationen ins Popup
						// Setze für Variations-Popup (verwende erstes OrderItem als "Haupt-Item")
						this.selectedItem = this.selectedMenuItem.orderItems[0]
						this.tmpSelectedItem = JSON.parse(
							JSON.stringify(this.selectedMenuItem.orderItems[0])
						)
						this.minusUsed = true
						this.lastClickedItem =
							this.selectedMenuItem.orderItems[0].product

						// Initialisiere tmpPickedVariationResource für alle Produkte
						this.tmpPickedVariationResource = []
						this.tmpCountVariations = 0

						// Load all products from MenuOrderItem into variation popup with their counts
						for (
							let productIndex = 0;
							productIndex < this.selectedMenuItem.orderItems.length;
							productIndex++
						) {
							let orderItem =
								this.selectedMenuItem.orderItems[productIndex]

							// For each OrderItemVariation of this product
							for (let orderItemVariation of orderItem.orderItemVariations) {
								// For each VariationItem in this OrderItemVariation
								for (let variationItem of orderItemVariation.variationItems) {
									// Skip Rabatt-items
									if (variationItem.name === "Rabatt") {
										continue
									}

									const tmpVariation = {
										uuid: variationItem.uuid,
										count: orderItemVariation.count,
										max: undefined as any,
										lastPickedVariation: undefined as any,
										combination:
											orderItem.product.name +
											": " +
											variationItem.name,
										display:
											orderItem.product.name +
											" - " +
											variationItem.name,
										pickedVariation: [variationItem]
									}

									this.tmpPickedVariationResource.push(
										new Map<number, TmpVariations[]>().set(0, [
											tmpVariation
										])
									)
								}
							}
						}

						// Öffne das SpecialVariationPopup für MenuOrderItem-Minus-Operationen
						this.isSpecialVariationPopupVisible = true
						this.isSpecialVariationMode = true
						this.tmpAllItemHandler = this.stagedItems
					}
				}

				this.removeEmptyMenuItem(this.stagedItems)
				this.showTotal()
			}
		} else {
			// Bestehende OrderItem Logik
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
					this.tmpSelectedItem = JSON.parse(
						JSON.stringify(this.selectedItem)
					)
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
				this.removeEmptyItem(this.stagedItems)
				this.showTotal()
			}
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

		// Je nach Modus das richtige Popup schließen
		if (this.isSpecialVariationMode) {
			this.isSpecialVariationPopupVisible = false
			this.isSpecialVariationMode = false
		} else {
			this.isItemPopupVisible = false
		}

		this.tmpVariations = []

		// Prüfe ob wir ein MenuOrderItem bearbeiten
		if (this.selectedMenuItem != null) {
			// MenuOrderItem-Behandlung: Aktualisiere nur das spezifische OrderItem

			// Finde das entsprechende OrderItem im MenuOrderItem
			let targetOrderItem = this.selectedMenuItem.orderItems.find(
				item => item.uuid === this.tmpSelectedItem.uuid
			)

			if (targetOrderItem) {
				// Erstelle Map der neuen Variationen für schnelle Suche
				let newVariationsMap = new Map<string, any>()
				for (let variationMap of this.tmpPickedVariationResource) {
					if (variationMap.get(this.tmpCountVariations)) {
						for (let variation of variationMap.get(
							this.tmpCountVariations
						)) {
							if (variation.count > 0) {
								// Verwende UUID des ersten VariationItems als Key
								newVariationsMap.set(
									variation.pickedVariation[0].uuid,
									{
										uuid: variation.uuid,
										count: variation.count,
										variationItems: variation.pickedVariation
									}
								)
							}
						}
					}
				}

				// Gehe durch die ursprünglichen Variationen in Paaren und behalte die Reihenfolge bei
				let updatedOrderItemVariations: OrderItemVariation[] = []

				for (
					let i = 0;
					i < targetOrderItem.orderItemVariations.length;
					i += 2
				) {
					let produktVariation = targetOrderItem.orderItemVariations[i]
					let rabattVariation = targetOrderItem.orderItemVariations[i + 1] // Der Rabatt kommt direkt danach

					// Prüfe ob diese Produkt-Variation noch in den neuen Variationen existiert
					let newVariation = newVariationsMap.get(
						produktVariation.variationItems[0].uuid
					)

					if (newVariation) {
						// Füge das Produkt hinzu
						updatedOrderItemVariations.push(newVariation)

						// Füge den dazugehörigen Rabatt hinzu (falls vorhanden)
						if (
							rabattVariation &&
							rabattVariation.variationItems[0]?.name === "Rabatt"
						) {
							updatedOrderItemVariations.push({
								uuid: rabattVariation.uuid,
								count: newVariation.count, // Verwende die neue Anzahl
								variationItems: rabattVariation.variationItems
							})
						}
					}
					// Wenn das Produkt nicht existiert, werden sowohl Produkt als auch Rabatt übersprungen
				}

				// Aktualisiere das OrderItem mit den neuen Variationen
				targetOrderItem.orderItemVariations = updatedOrderItemVariations

				// Berechne die neue Gesamtanzahl (nur Nicht-Rabatt-Items)
				let totalCount = 0
				for (let variation of updatedOrderItemVariations) {
					let hasNonRabatt = variation.variationItems.some(
						vi => vi.name !== "Rabatt"
					)
					if (hasNonRabatt) {
						totalCount += variation.count
					}
				}
				targetOrderItem.count = totalCount

				// Entferne das OrderItem wenn count = 0
				if (targetOrderItem.count <= 0) {
					this.selectedMenuItem.orderItems =
						this.selectedMenuItem.orderItems.filter(
							item => item.uuid !== targetOrderItem.uuid
						)
				}

				// Entferne das gesamte MenuOrderItem wenn keine OrderItems mehr vorhanden
				if (this.selectedMenuItem.orderItems.length === 0) {
					this.stagedItems.deleteMenuItem(this.selectedMenuItem)
				} else {
					// Aktualisiere MenuOrderItem count basierend auf verbleibenden OrderItems
					this.selectedMenuItem.count =
						this.selectedMenuItem.orderItems.reduce(
							(sum, item) => sum + item.count,
							0
						)
				}
			}
		} else if (this.selectedItem != null) {
			// Normale OrderItem-Behandlung (bleibt wie vorher)
			this.selectedItem.count = this.tmpSelectedItem.count
			this.selectedItem.orderItemVariations =
				this.tmpSelectedItem.orderItemVariations

			if (this.tmpAllItemHandler === this.bookedItems) {
				this.sendOrderItem(orderItem)
			}
		}

		// Cleanup (wie in sendVariation)
		this.tmpPickedVariationResource = []
		this.tmpCountVariations = 0
		this.tmpSelectedItem = undefined
		this.selectedMenuItem = null
		this.showTotal()

		// Je nach Modus den richtigen ItemHandler verwenden
		if (this.isSpecialVariationMode) {
			this.removeEmptyItem(this.tmpSpecialAllItemsHandler)
		} else {
			this.removeEmptyItem(this.tmpAllItemHandler)
		}
	}

	removeEmptyItem(itemHandler: AllItemHandler) {
		if (this.selectedItem.count == 0) {
			itemHandler.deleteItem(this.selectedItem)
		} else {
			// Verwende filter statt splice während der Iteration
			this.selectedItem.orderItemVariations =
				this.selectedItem.orderItemVariations.filter(
					variation => variation.count > 0
				)
		}
	}

	removeEmptyMenuItem(itemHandler: AllItemHandler) {
		if (this.selectedMenuItem.count == 0) {
			itemHandler.deleteMenuItem(this.selectedMenuItem)
		} else {
			// Entferne leere OrderItemVariations von den OrderItems des MenuItems
			for (let orderItem of this.selectedMenuItem.orderItems) {
				orderItem.orderItemVariations =
					orderItem.orderItemVariations.filter(
						variation => variation.count > 0
					)
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
												variation.display +
												" " +
												variationItem.name,
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
			// Prüfe ob wir im Edit-Modus für Specials sind
			if (
				this.isSpecialVariationMode &&
				this.selectedItem &&
				!this.minusUsed
			) {
				// Edit-Modus: Aktualisiere das bestehende Item
				let updatedOrderItemVariations: OrderItemVariation[] = []

				for (let variationMap of this.tmpPickedVariationResource) {
					if (variationMap.get(this.tmpCountVariations)) {
						for (let variation of variationMap.get(
							this.tmpCountVariations
						)) {
							if (variation.count > 0) {
								updatedOrderItemVariations.push({
									uuid: variation.uuid,
									count: variation.count,
									variationItems: variation.pickedVariation
								})
							}
						}
					}
				}

				// Aktualisiere das selectedItem mit den neuen Variationen
				this.selectedItem.orderItemVariations = updatedOrderItemVariations

				// Berechne die neue Gesamtanzahl
				let totalCount = 0
				for (let variation of updatedOrderItemVariations) {
					totalCount += variation.count
				}
				this.selectedItem.count = totalCount

				this.isSpecialVariationPopupVisible = false
				this.isSpecialVariationMode = false
			} else {
				// Normaler Modus: Erstelle neues OrderItem
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

				// Je nach Modus in stagedItems oder tmpSpecialAllItemsHandler hinzufügen
				if (this.isSpecialVariationMode) {
					// Prüfe ob wir ein MenuOrderItem erstellen sollen
					if (this.lastClickedMenuItem) {
						// Verwende confirmSpecials Logik - füge zu tmpSpecialAllItemsHandler hinzu und rufe confirmSpecials auf
						this.tmpSpecialAllItemsHandler.pushNewItem(orderItem)
						// Temporär currentSpecial und andere Werte für confirmSpecials setzen
						const originalSpecial = this.currentSpecial
						this.currentSpecial = this.lastClickedMenuItem.offer
						this.confirmSpecials()
						this.currentSpecial = originalSpecial
					} else {
						// Normal für tmpSpecialAllItemsHandler
						this.tmpSpecialAllItemsHandler.pushNewItem(orderItem)
					}
					this.isSpecialVariationPopupVisible = false
				} else {
					this.stagedItems.pushNewItem(orderItem)
					this.isItemPopupVisible = false
				}
			}

			this.tmpPickedVariationResource = []
			this.tmpCountVariations = 0
			this.isSpecialVariationMode = false
			this.tmpLastPickedVariation = []
			this.lastClickedMenuItem = null
			console.log("showtotal aufgerufen")
			this.showTotal()
		}
	}

	async loadTable(uuid: string) {
		if (uuid == null) return

		for (let room of this.dataService.restaurant.rooms) {
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
						bill {
							uuid
						}
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
			if (this.orderUuid == null) {
				this.orderUuid = order.data.retrieveTable.orders.items[0].uuid
				this.billUuid = order.data.retrieveTable.orders.items[0].bill?.uuid
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
		console.log("showtotal aufgerufen", this.console)
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
		variationItem.count += 1
	}

	//Verringert eine Variation um eins oder entfernt diese
	removeVariation(variation: TmpVariations) {
		if (variation.count > 0) {
			variation.count -= 1
		}
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
		this.selectedMenuItem = null
	}

	selectMenuItem(pickedItem: OfferOrderItem, AllItemHandler: AllItemHandler) {
		this.selectedMenuItem = pickedItem
		for (let item of this.selectedMenuItem.offer.offerItems) {
			console.log("Selected Menu Item maxSelections", item.maxSelections)
		}
		this.tmpAllItemHandler = AllItemHandler
		this.selectedItem = null
	}

	//Füge selektiertes Item hinzu
	addSelectedItem(orderItem: OrderItem | OfferOrderItem) {
		this.clickItem(orderItem.product)
	}

	addSelectedMenuItem(menuItem: OfferOrderItem) {
		this.clickMenuItem(menuItem)
	}

	async createBill(payment: PaymentMethod) {
		// Create a bill if it doesn't exist
		if (this.billUuid == null) {
			// TODO: Get the current register client
			const createBillResponse = await this.apiService.createBill(`uuid`, {
				registerClientUuid: "eb76aee4-0054-4e56-89b1-0cbefde357a9"
			})

			if (createBillResponse.data == null) {
				return
			}

			this.billUuid = createBillResponse.data.createBill.uuid
		}

		const completeOrderResponse = await this.apiService.completeOrder(
			"uuid",
			{
				uuid: this.orderUuid,
				billUuid: this.billUuid,
				paymentMethod: payment
			}
		)

		if (completeOrderResponse.data == null) {
			// TODO: Error handling
			return
		}

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
			`,
			{ completed: true }
		)
		this.bills = []

		for (let orderResource of listOrdersResult.data.listOrders.items) {
			this.bills.push(convertOrderResourceToOrder(orderResource))

			this.bills.sort((a, b) => {
				if (a.paidAt > b.paidAt) {
					return -1
				} else if (a.paidAt < b.paidAt) {
					return 1
				} else {
					return 0
				}
			})
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
		this.router.navigate(["dashboard", "tables", this.table.uuid, table.uuid])
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

		return (
			(total + orderItem.product.price * orderItem.count) /
			100
		).toFixed(2)
	}

	checkForPlusaddVariation(variation: TmpVariations) {
		let totalCount = 0

		// Count all variations with the same lastPickedVariation
		for (let variationMap of this.tmpPickedVariationResource) {
			if (variationMap.get(this.tmpCountVariations)) {
				for (let tmpVariation of variationMap.get(
					this.tmpCountVariations
				)) {
					if (
						variation.lastPickedVariation ===
						tmpVariation.lastPickedVariation
					) {
						totalCount += tmpVariation.count
					}
				}
			}
		}

		if (this.tmpAnzahl > 0) {
			// Don't allow adding more variations than tmpAnzahl
			if (totalCount >= this.tmpAnzahl) {
				return true // Disable the button
			}
		}

		// If no max is defined, allow adding
		if (variation.max === undefined) {
			return false
		}

		// Return true to disable the button when total count reaches or exceeds max
		return totalCount >= variation.max
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

		return null
	}

	checkForSendVariation() {
		let count = 0
		let maxCount = 0
		let countVariations: TmpVariations[] = []

		for (let variationMap of this.tmpPickedVariationResource) {
			if (variationMap.get(this.tmpCountVariations)) {
				for (let tmpVariation of variationMap
					.get(this.tmpCountVariations)
					.values()) {
					count += tmpVariation.count
					// Prüfen, ob bereits ein Eintrag mit der gleichen lastPickedVariation existiert
					const exists = countVariations.some(
						v =>
							v.lastPickedVariation === tmpVariation.lastPickedVariation
					)

					if (!exists) {
						countVariations.push(tmpVariation)
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
		let total = 0

		for (const item of bill.orderItems) {
			total += item.product.price * item.count

			for (const variation of item.orderItemVariations) {
				for (const variationItem of variation.variationItems) {
					total += variation.count * variationItem.additionalCost
				}
			}
		}

		return (total / 100).toFixed(2)
	}

	clickSpecial(special: Offer) {
		this.currentSpecial = special
		this.currentMenu = null
		this.isMenuePopupVisible = true

		for (let item of special.offerItems) {
			for (let product of item.products) {
				this.specialCategories.push(product.category)
			}
		}
	}

	clickMenu(menu: Offer) {
		this.currentMenu = JSON.parse(JSON.stringify(menu))
		this.currentSpecial = null
		this.isMenuePopupVisible = true
		this.changeSelectedMenuInventory(
			this.currentMenu.offerItems[0],
			this.currentMenu.offerItems[0].maxSelections,
			0
		)

		for (let item of this.currentMenu.offerItems) {
			for (let product of item.products) {
				this.specialCategories.push(product.category)
			}
		}
	}

	changeSelectedSpecialInventory(items: Product[]) {
		this.specialProducts = items
	}

	changeSelectedMenuInventory(
		menuItem: OfferItem,
		maxSelections: number,
		index?: number
	) {
		let allProducts: Product[] = []
		allProducts = allProducts.concat(menuItem.products)
		this.specialProducts = allProducts
		this.currentMaxSelections = maxSelections
		this.currentIndex = index
	}

	findNextAvailableCategory(): number {
		if (!this.currentMenu) return -1

		// Starte bei der nächsten Kategorie nach der aktuellen
		for (
			let i = this.currentIndex + 1;
			i < this.currentMenu.offerItems.length;
			i++
		) {
			if (this.currentMenu.offerItems[i].maxSelections > 0) {
				return i
			}
		}

		// Falls keine gefunden, suche von Anfang bis zur aktuellen Position
		for (let i = 0; i < this.currentIndex; i++) {
			if (this.currentMenu.offerItems[i].maxSelections > 0) {
				return i
			}
		}

		// Keine verfügbare Kategorie gefunden
		return -1
	}

	closeSpecials() {
		// Stelle die ursprünglichen maxSelections wieder her, falls ein Menü aktiv war
		if (this.currentMenu) {
			// Gehe durch alle Items im temporären Handler und stelle maxSelections wieder her
			for (let item of this.tmpSpecialAllItemsHandler.getAllPickedItems()) {
				// Finde die entsprechende Kategorie für dieses Produkt
				for (let menuItem of this.currentMenu.offerItems) {
					for (let product of menuItem.products) {
						if (product.uuid === item.product.uuid) {
							menuItem.maxSelections += item.count
							break
						}
					}
				}
			}
		}

		this.isMenuePopupVisible = false
		this.specialCategories = []
		this.specialProducts = []
		this.selectedInventory = []
		this.currentSpecial = null
		this.currentMenu = null // Menü-Variable zurücksetzen
		this.currentIndex = 0 // Index zurücksetzen
		this.currentMaxSelections = 0 // MaxSelections zurücksetzen
		this.tmpSpecialAllItemsHandler = new AllItemHandler()
		this.lastClickedMenuItem = null
	}

	clickSpecialProduct(product: Product) {
		if (product == null) return

		if (this.currentMenu) {
			this.currentMenu.offerItems[this.currentIndex].maxSelections -= 1
			this.currentMaxSelections =
				this.currentMenu.offerItems[this.currentIndex].maxSelections

			// Wenn maxSelections = 0, dann nächsten Index suchen
			if (this.currentMaxSelections === 0) {
				let nextIndex = this.findNextAvailableCategory()
				// Wenn gültiger Index gefunden wurde
				if (nextIndex !== -1) {
					this.currentIndex = nextIndex
					this.changeSelectedMenuInventory(
						this.currentMenu.offerItems[this.currentIndex],
						this.currentMenu.offerItems[this.currentIndex].maxSelections,
						this.currentIndex
					)
				}
			}
		}

		let newItem: OrderItem = {
			uuid: product.uuid,
			count: 0,
			order: null,
			product,
			orderItemVariations: []
		}

		if (product.variations.length === 0) {
			// Produkt ohne Variationen, direkt hinzufügen
			if (this.tmpSpecialAllItemsHandler.includes(newItem)) {
				let existingItem = this.tmpSpecialAllItemsHandler.getItem(
					newItem.product.id
				)
				existingItem.count += 1
			} else {
				newItem.count = 1
				this.tmpSpecialAllItemsHandler.pushNewItem(newItem)
			}
		} else {
			// Special-Variation-Popup öffnen
			this.lastClickedItem = product
			this.tmpPickedVariationResource = []

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

			this.isSpecialVariationPopupVisible = true
			this.isSpecialVariationMode = true
		}
	}

	addSpecial(item: OrderItem) {
		item.count += 1
	}

	removeSpecial(item: OrderItem) {
		// Einfaches Item ohne Variationen
		item.count -= 1
		if (item.count === 0) {
			this.tmpSpecialAllItemsHandler.deleteItem(item)
		}
	}

	removeMenuItem(item: OrderItem) {
		// Entferne das Item aus der temporären Liste
		item.count -= 1
		if (item.count === 0) {
			this.tmpSpecialAllItemsHandler.deleteItem(item)
		}

		// Finde die entsprechende Kategorie basierend auf dem Produkt
		let targetCategoryIndex = -1
		for (let i = 0; i < this.currentMenu.offerItems.length; i++) {
			const menuItem = this.currentMenu.offerItems[i]

			let fountCategory = false

			for (let product of menuItem.products) {
				if (product.uuid === item.product.uuid) {
					fountCategory = true
					break
				}
			}

			if (fountCategory) {
				targetCategoryIndex = i
				break
			}
		}

		// Erhöhe die maxSelections der entsprechenden Kategorie
		if (targetCategoryIndex >= 0) {
			this.currentMenu.offerItems[targetCategoryIndex].maxSelections += 1

			// Springe zur entsprechenden Kategorie
			this.currentIndex = targetCategoryIndex
			this.changeSelectedMenuInventory(
				this.currentMenu.offerItems[targetCategoryIndex],
				this.currentMenu.offerItems[targetCategoryIndex].maxSelections,
				targetCategoryIndex
			)
		}
	}

	editSpecial(item: OrderItem) {
		// Item hat Variationen - öffne Variations-Popup für Bearbeitung
		this.selectedItem = item
		this.tmpSelectedItem = JSON.parse(JSON.stringify(item)) // Deep copy für Bearbeitung
		this.minusUsed = false // Edit-Modus, nicht Minus-Modus
		this.lastClickedItem = item.product // Setze das Produkt für sendVariation

		// Initialisiere tmpPickedVariationResource mit den bestehenden Variationen
		this.tmpPickedVariationResource = []
		this.tmpCountVariations = 0

		// Lade die bestehenden Variationen des Items
		// Verwende die bestehenden Variationen für das Popup
		for (let orderItemVariation of item.orderItemVariations) {
			for (let variationItem of orderItemVariation.variationItems) {
				// Überspringe Rabatt-Items
				if (variationItem.name === "Rabatt") {
					continue
				}

				this.tmpPickedVariationResource.push(
					new Map<number, TmpVariations[]>().set(0, [
						{
							uuid: variationItem.uuid,
							count: orderItemVariation.count,
							max: undefined,
							lastPickedVariation: undefined,
							combination: variationItem.name,
							display: variationItem.name,
							pickedVariation: [variationItem]
						}
					])
				)
			}
		}

		this.isSpecialVariationPopupVisible = true
		this.isSpecialVariationMode = true
		this.tmpAllItemHandler = this.tmpSpecialAllItemsHandler
	}

	confirmSpecials() {
		let rabattFaktor = 0

		// Prüfe ob wir im Special-Modus oder Menü-Modus sind
		if (
			this.currentSpecial &&
			this.currentSpecial.discountType === "PERCENTAGE"
		) {
			rabattFaktor = this.currentSpecial.offerValue / 100
		}

		// Durch alle ausgewählten Produkte gehen und für jedes ein separates MenuOrderItem erstellen
		for (let item of this.tmpSpecialAllItemsHandler.getAllPickedItems()) {
			let processedItem: OrderItem = JSON.parse(JSON.stringify(item))
			let existingVariations = [...processedItem.orderItemVariations]
			let newOrderItemVariations: OrderItemVariation[] = []

			// Füge für jede bestehende OrderItemVariation die Variation und direkt danach den Rabatt hinzu
			for (let orderItemVariation of existingVariations) {
				// Füge die ursprüngliche Variation hinzu
				newOrderItemVariations.push(orderItemVariation)

				// Berechne Rabatt für diese Variation
				let sumAdditional = orderItemVariation.variationItems.reduce(
					(acc, vi) => acc + vi.additionalCost,
					0
				)
				let originalCostPerUnit =
					processedItem.product.price + sumAdditional
				let rabattBetrag = -(originalCostPerUnit * rabattFaktor)

				let rabattVariation: OrderItemVariation = {
					uuid: crypto.randomUUID(),
					count: orderItemVariation.count,
					variationItems: [
						{
							id: 0,
							uuid: crypto.randomUUID(),
							name: "Rabatt",
							additionalCost: rabattBetrag
						}
					]
				}
				newOrderItemVariations.push(rabattVariation)
			}

			// Ersetze die ursprünglichen Variationen mit der neuen sortierten Liste
			processedItem.orderItemVariations = newOrderItemVariations

			// Für Produkte ohne Variationen: Rabatt direkt auf das Basis-Produkt anwenden
			if (existingVariations.length === 0) {
				let originalCost = processedItem.product.price
				let rabattBetrag = -(originalCost * rabattFaktor)

				let rabattVariation: OrderItemVariation = {
					uuid: crypto.randomUUID(),
					count: processedItem.count,
					variationItems: [
						{
							id: 0,
							uuid: crypto.randomUUID(),
							name: "Rabatt",
							additionalCost: rabattBetrag
						}
					]
				}

				processedItem.orderItemVariations.push(rabattVariation)
			}

			let itemPrice = this.calculateSpecialPrice(processedItem)
			console.log("Item Price:", itemPrice)

			// Bestimme das aktuelle Menü/Special für MenuOrderItem
			let currentMenuOrSpecial = this.currentMenu || this.currentSpecial
			let menuName = currentMenuOrSpecial
				? currentMenuOrSpecial.name
				: "Unknown Menu"

			let menuOrderItem: OfferOrderItem = {
				uuid: crypto.randomUUID(),
				count: processedItem.count,
				order: null,
				offer: currentMenuOrSpecial,
				product: {
					id: processedItem.product.id,
					uuid: processedItem.product.uuid,
					name: menuName,
					price: itemPrice,
					category: processedItem.product.category,
					variations: []
				},
				orderItems: [processedItem]
			}

			if (this.stagedItems.includesOfferItem(menuOrderItem)) {
				for (let item of this.stagedItems.getAllPickedMenuItems()) {
					for (let orderItem of item.orderItems) {
						if (orderItem.product.id === processedItem.product.id) {
							// Wenn das Produkt übereinstimmt, füge die OrderItemVariationen hinzu
							orderItem.count += processedItem.count

							// Füge auch die neuen Variationen (inklusive Rabatt) hinzu
							// Neue Logik: paarweise Mergen (Basisvariation gefolgt von Rabatt)
							let isDiscountVar = (v: OrderItemVariation) =>
								v.variationItems.length === 1 &&
								v.variationItems[0].name === "Rabatt"
							let basesEqual = (
								a: OrderItemVariation,
								b: OrderItemVariation
							) => {
								if (isDiscountVar(a) || isDiscountVar(b)) return false
								if (a.variationItems.length !== b.variationItems.length)
									return false
								for (let i = 0; i < a.variationItems.length; i++) {
									let ai = a.variationItems[i]
									let bi = b.variationItems[i]
									if (ai.name !== bi.name) return false
									if (ai.additionalCost !== bi.additionalCost)
										return false
								}
								return true
							}

							let idx = 0
							while (idx < processedItem.orderItemVariations.length) {
								let newVar = processedItem.orderItemVariations[idx]
								if (!isDiscountVar(newVar)) {
									// Basisvariation finden/erstellen
									let baseIdx =
										orderItem.orderItemVariations.findIndex(ex =>
											basesEqual(ex, newVar)
										)
									if (baseIdx >= 0) {
										orderItem.orderItemVariations[baseIdx].count +=
											newVar.count
									} else {
										orderItem.orderItemVariations.push({ ...newVar })
										baseIdx = orderItem.orderItemVariations.length - 1
									}

									// Falls die nächste neue Variation ein Rabatt ist, direkt dahinter mergen/einfügen
									let hasNextDiscount =
										idx + 1 <
											processedItem.orderItemVariations.length &&
										isDiscountVar(
											processedItem.orderItemVariations[idx + 1]
										)
									if (hasNextDiscount) {
										let newDisc =
											processedItem.orderItemVariations[idx + 1]
										let expectedDiscCost =
											newDisc.variationItems[0].additionalCost

										if (
											baseIdx + 1 <
												orderItem.orderItemVariations.length &&
											isDiscountVar(
												orderItem.orderItemVariations[baseIdx + 1]
											) &&
											orderItem.orderItemVariations[baseIdx + 1]
												.variationItems[0].additionalCost ===
												expectedDiscCost
										) {
											orderItem.orderItemVariations[
												baseIdx + 1
											].count += newDisc.count
										} else {
											orderItem.orderItemVariations.splice(
												baseIdx + 1,
												0,
												{ ...newDisc }
											)
										}
										idx += 2
									} else {
										idx += 1
									}
								} else {
									// Standalone-Rabatt (z. B. Produkt ohne Variationen)
									let expectedDiscCost =
										newVar.variationItems[0].additionalCost
									let existingDiscIdx =
										orderItem.orderItemVariations.findIndex(
											ex =>
												isDiscountVar(ex) &&
												ex.variationItems[0].additionalCost ===
													expectedDiscCost
										)
									if (existingDiscIdx >= 0) {
										orderItem.orderItemVariations[
											existingDiscIdx
										].count += newVar.count
									} else {
										orderItem.orderItemVariations.push({ ...newVar })
									}
									idx += 1
								}
							}
						}
					}

					// Aktualisiere den Gesamtpreis des MenuItems
					let totalPrice = 0
					for (let orderItem of item.orderItems) {
						totalPrice += this.calculateSpecialPrice(orderItem)
					}
					item.product.price = totalPrice
				}
			} else {
				this.stagedItems.pushNewMenuItem(menuOrderItem)
			}
		}

		// Cleanup
		this.isMenuePopupVisible = false
		this.specialCategories = []
		this.specialProducts = []
		this.selectedInventory = []
		this.currentSpecial = null
		this.tmpSpecialAllItemsHandler = new AllItemHandler()
		this.showTotal()
	}

	confirmMenu() {
		let allOrderItems: OrderItem[] = []
		let originalTotalPrice = 0

		// Durch alle ausgewählten Produkte gehen
		for (let item of this.tmpSpecialAllItemsHandler.getAllPickedItems()) {
			let processedItem: OrderItem = JSON.parse(JSON.stringify(item))
			allOrderItems.push(processedItem)

			let itemPrice = processedItem.product.price * processedItem.count
			for (let variation of processedItem.orderItemVariations) {
				for (let variationItem of variation.variationItems) {
					itemPrice += variation.count * variationItem.additionalCost
				}
			}
			originalTotalPrice += itemPrice
		}

		let finalMenuPrice = originalTotalPrice
		let totalRabattBetrag = 0

		if (this.currentMenu && this.currentMenu.offerType) {
			switch (this.currentMenu.offerType) {
				case "FIXED_PRICE":
					finalMenuPrice = this.currentMenu.offerValue
					totalRabattBetrag = finalMenuPrice - originalTotalPrice
					break
				case "DISCOUNT":
					if (this.currentMenu.discountType === "PERCENTAGE") {
						finalMenuPrice =
							originalTotalPrice *
							(1 - this.currentMenu.offerValue / 100)
						totalRabattBetrag = finalMenuPrice - originalTotalPrice
					} else if (this.currentMenu.discountType === "AMOUNT") {
						finalMenuPrice =
							originalTotalPrice - this.currentMenu.offerValue
						totalRabattBetrag = -this.currentMenu.offerValue
					}
					break
				default:
					finalMenuPrice = originalTotalPrice
					break
			}
		}

		let offerOrderItem: OfferOrderItem = {
			uuid: crypto.randomUUID(),
			count: 1,
			order: null,
			offer: this.currentMenu,
			product: {
				id: 1,
				uuid: crypto.randomUUID(),
				name: this.currentMenu.name,
				price: finalMenuPrice,
				category: null,
				variations: []
			},
			orderItems: allOrderItems
		}

		// Rabattvariation am ende einfügen
		if (allOrderItems.length > 0 && totalRabattBetrag !== 0) {
			let menuRabattVariation: OrderItemVariation = {
				uuid: crypto.randomUUID(),
				count: 1,
				variationItems: [
					{
						id: 0,
						uuid: crypto.randomUUID(),
						name: "Rabatt",
						additionalCost: totalRabattBetrag
					}
				]
			}

			allOrderItems[allOrderItems.length - 1].orderItemVariations.push(
				menuRabattVariation
			)
		}

		// Prüfe ob ein ähnliches MenuOrderItem bereits existiert und merge, oder füge neu hinzu
		let existingMenuItem = this.stagedItems
			.getAllPickedMenuItems()
			.find(item => item.offer.uuid === this.currentMenu.uuid)
		if (existingMenuItem) {
			existingMenuItem.count += 1
			// Füge alle OrderItems hinzu oder merge sie
			for (let newOrderItem of allOrderItems) {
				let existingOrderItem = existingMenuItem.orderItems.find(
					(oi: OrderItem) => oi.product.id === newOrderItem.product.id
				)
				if (existingOrderItem) {
					existingOrderItem.count += newOrderItem.count
					// Merge Variationen
					for (let newVar of newOrderItem.orderItemVariations) {
						existingOrderItem.orderItemVariations.push(newVar)
					}
				} else {
					existingMenuItem.orderItems.push(newOrderItem)
				}
			}
			existingMenuItem.product.price += finalMenuPrice
		} else {
			this.stagedItems.pushNewMenuItem(offerOrderItem)
		}

		// Cleanup
		this.isMenuePopupVisible = false
		this.specialCategories = []
		this.specialProducts = []
		this.selectedInventory = []
		this.currentMenu = null
		this.tmpSpecialAllItemsHandler = new AllItemHandler()
		this.showTotal()
	}

	calculateSpecialPrice(item: OrderItem): number {
		let originalPrice = item.product.price * item.count

		for (let variation of item.orderItemVariations) {
			for (let variationItem of variation.variationItems) {
				if (variationItem.name !== "Rabatt") {
					originalPrice += variation.count * variationItem.additionalCost
				}
			}
		}

		let itemPrice = originalPrice

		// Bestimme das aktuelle Menü oder Special für Preisberechnung
		let currentMenuOrSpecial = this.currentSpecial || this.currentMenu

		if (currentMenuOrSpecial && currentMenuOrSpecial.offerType) {
			switch (currentMenuOrSpecial.offerType) {
				case "FIXED_PRICE":
					itemPrice = currentMenuOrSpecial.offerValue
					break
				case "DISCOUNT":
					if (currentMenuOrSpecial.discountType === "PERCENTAGE") {
						itemPrice =
							originalPrice * (1 - currentMenuOrSpecial.offerValue / 100)
					} else if (currentMenuOrSpecial.discountType === "AMOUNT") {
						itemPrice = originalPrice - currentMenuOrSpecial.offerValue
					}
					break
				default:
					itemPrice = originalPrice
					break
			}
		}

		return itemPrice
	}
}
