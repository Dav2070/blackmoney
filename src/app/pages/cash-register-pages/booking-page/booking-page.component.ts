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
import { MenuOrderItem } from "src/app/models/MenuOrderItem"
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
import {
	List,
	OrderItemVariationResource,
	PaymentMethod,
	VariationResource
} from "src/app/types"
import { threadId } from "node:worker_threads"
import { VariationItem } from "src/app/models/VariationItem"
import { OrderResource } from "dav-js"
import { Order } from "src/app/models/Order"
import { MenuePageComponent } from '../../settings-pages/menue-page/menue-page.component';
import { Menu } from "src/app/models/Menu"


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

	menuInventory = new MenuePageComponent();
	menues: Menu[] = [];
	specials: Menu[] = [];
	isMenuePopupVisible: boolean = false;
	specialCategories: Category[] = [];
	specialProducts: Product[] = [];
	currentSpecial: Menu | null = null;
	tmpSpecialSelectedItems: OrderItem[] = [];
	tmpSpecialAllItemsHandler = new AllItemHandler()
	selectedMenuItem: MenuOrderItem = null
	lastClickedMenuItem: MenuOrderItem = null

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

	constructor(
		private dataService: DataService,
		private apiService: ApiService,
		private activatedRoute: ActivatedRoute,
		private hardCodedService: HardcodeService,
		private router: Router,
		@Inject(PLATFORM_ID) private platformId: object
	) {}

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
		this.menues = [];
    	this.specials = [];
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
		if (this.minusUsed === true) {
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

	clickMenuItem(menuItem: MenuOrderItem) {
		let newItem: MenuOrderItem = {
			uuid: menuItem.uuid,
			count: 0,
			order: null,
			menu: menuItem.menu,
			name: menuItem.name,
			product: menuItem.product,
			orderItems: []
		}

		//Wenn das Menü nur ein Produkt enthält
		if (menuItem.orderItems.length === 1 && menuItem.orderItems[0].orderItemVariations.length === 1) {	
			if (this.tmpAnzahl > 0) {
				//Menu exisitiert bereits in stagedItems
				if (this.stagedItems.includesMenuItem(menuItem)) {
					let existingItem = this.stagedItems.getMenuItem(newItem.product.id, newItem.menu.uuid)
					existingItem.count += this.tmpAnzahl
					existingItem.orderItems[0].count += this.tmpAnzahl
					existingItem.orderItems[0].orderItemVariations[0].count += this.tmpAnzahl
				} else { //Menu existiert nicht in stagedItems
					newItem.count = this.tmpAnzahl
					this.stagedItems.pushNewMenuItem(newItem)
				}
				
			}else if (this.stagedItems.includesMenuItem(menuItem)) {
				let existingItem = this.stagedItems.getMenuItem(newItem.product.id, newItem.menu.uuid)
				existingItem.count += 1
				existingItem.orderItems[0].count += 1
				existingItem.orderItems[0].orderItemVariations[0].count += 1
			}
			this.showTotal()
		} else {
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
		// Prüfe ob ein MenuItem selektiert ist
		if (this.selectedMenuItem != null) {
			// MenuOrderItem Logik
			if (this.tmpAllItemHandler === this.bookedItems) {
				// Für gebuchte MenuItems - einfache Reduzierung ohne Variationen-Popup
				if (this.tmpAnzahl > 0) {
					if (this.selectedMenuItem.count > this.tmpAnzahl) {
							this.selectedMenuItem.orderItems[0].count -= this.tmpAnzahl
							this.selectedMenuItem.orderItems[0].orderItemVariations[0].count -= this.tmpAnzahl
					} else if (this.selectedMenuItem.count === this.tmpAnzahl) {
						this.stagedItems.deleteMenuItem(this.selectedMenuItem)
					} else {
						window.alert("Anzahl ist zu hoch")
					}
				} else {
					this.selectedMenuItem.count -= 1
					// Reduziere auch das erste OrderItem entsprechend
					if (this.selectedMenuItem.orderItems.length > 0) {
						this.selectedMenuItem.orderItems[0].count -= 1
						if (this.selectedMenuItem.orderItems[0].orderItemVariations.length > 0) {
							this.selectedMenuItem.orderItems[0].orderItemVariations[0].count -= 1
						}
					}
				}

				this.removeEmptyMenuItem(this.bookedItems)
				this.showTotal()
			} else {
				// Für staged MenuItems 
				if (this.selectedMenuItem.orderItems.length === 1 && this.selectedMenuItem.orderItems[0].orderItemVariations.length === 1) {
					if (this.tmpAnzahl > 0) {
						if (this.selectedMenuItem.count >= this.tmpAnzahl) {
							this.selectedMenuItem.count -= this.tmpAnzahl
							this.selectedMenuItem.orderItems[0].count -= this.tmpAnzahl
							this.selectedMenuItem.orderItems[0].orderItemVariations[0].count -= this.tmpAnzahl
						}  else {
							window.alert("Anzahl ist zu hoch")
						}
					} else {	// Normal Minus
						if(this.selectedMenuItem.count > 0) {
							this.selectedMenuItem.count -= 1
							this.selectedMenuItem.orderItems[0].count -= 1
							this.selectedMenuItem.orderItems[0].orderItemVariations[0].count -= 1
						}
						this.removeEmptyMenuItem(this.stagedItems)
					}
				} else {
					// Mehrere Produkte im Menü - lade alle Produkte mit ihren Variationen ins Popup
					
					// Setze für Variations-Popup (verwende erstes OrderItem als "Haupt-Item")
					this.selectedItem = this.selectedMenuItem.orderItems[0];
					this.tmpSelectedItem = JSON.parse(JSON.stringify(this.selectedMenuItem.orderItems[0]));
					this.minusUsed = true; // Minus-Modus - nur entfernen möglich
					this.lastClickedItem = this.selectedMenuItem.orderItems[0].product;
					
					// Initialisiere tmpPickedVariationResource für alle Produkte
					this.tmpPickedVariationResource = [];
					this.tmpCountVariations = 0;
					
					// Load all products from MenuOrderItem into variation popup with their counts
					for (let productIndex = 0; productIndex < this.selectedMenuItem.orderItems.length; productIndex++) {
						let orderItem = this.selectedMenuItem.orderItems[productIndex];
						
						// For each OrderItemVariation of this product
						for (let orderItemVariation of orderItem.orderItemVariations) {
							// For each VariationItem in this OrderItemVariation
							for (let variationItem of orderItemVariation.variationItems) {
								// Skip Rabatt-items
								if (variationItem.name === "Rabatt") {
									continue;
								}
								
								const tmpVariation = {
									uuid: variationItem.uuid,
									count: orderItemVariation.count,
									max: undefined as any,
									lastPickedVariation: undefined as any,
									combination: orderItem.product.name + ": " + variationItem.name,
									display: orderItem.product.name + " - " + variationItem.name,
									pickedVariation: [variationItem]
								};
								
								this.tmpPickedVariationResource.push(
									new Map<number, TmpVariations[]>().set(0, [tmpVariation])
								);
							}
						}
					}
					
					// Öffne das SpecialVariationPopup für MenuOrderItem-Minus-Operationen
					this.isSpecialVariationPopupVisible = true;
					this.isSpecialVariationMode = true;
					this.tmpAllItemHandler = this.stagedItems;
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
			let targetOrderItem = this.selectedMenuItem.orderItems.find(item => 
				item.uuid === this.tmpSelectedItem.uuid
			);
			
			if (targetOrderItem) {
				// Erstelle Map der neuen Variationen für schnelle Suche
				let newVariationsMap = new Map<string, any>();
				for (let variationMap of this.tmpPickedVariationResource) {
					if (variationMap.get(this.tmpCountVariations)) {
						for (let variation of variationMap.get(this.tmpCountVariations)) {
							if (variation.count > 0) {
								// Verwende UUID des ersten VariationItems als Key
								newVariationsMap.set(variation.pickedVariation[0].uuid, {
									uuid: variation.uuid,
									count: variation.count,
									variationItems: variation.pickedVariation
								});
							}
						}
					}
				}

				// Gehe durch die ursprünglichen Variationen in Paaren und behalte die Reihenfolge bei
				let updatedOrderItemVariations: OrderItemVariation[] = []
				
				for (let i = 0; i < targetOrderItem.orderItemVariations.length; i += 2) {
					let produktVariation = targetOrderItem.orderItemVariations[i];
					let rabattVariation = targetOrderItem.orderItemVariations[i + 1]; // Der Rabatt kommt direkt danach
					
					// Prüfe ob diese Produkt-Variation noch in den neuen Variationen existiert
					let newVariation = newVariationsMap.get(produktVariation.variationItems[0].uuid);
					
					if (newVariation) {
						// Füge das Produkt hinzu
						updatedOrderItemVariations.push(newVariation);
						
						// Füge den dazugehörigen Rabatt hinzu (falls vorhanden)
						if (rabattVariation && rabattVariation.variationItems[0]?.name === "Rabatt") {
							updatedOrderItemVariations.push({
								uuid: rabattVariation.uuid,
								count: newVariation.count, // Verwende die neue Anzahl
								variationItems: rabattVariation.variationItems
							});
						}
					}
					// Wenn das Produkt nicht existiert, werden sowohl Produkt als auch Rabatt übersprungen
				}

				// Aktualisiere das OrderItem mit den neuen Variationen
				targetOrderItem.orderItemVariations = updatedOrderItemVariations
				
				// Berechne die neue Gesamtanzahl (nur Nicht-Rabatt-Items)
				let totalCount = 0
				for (let variation of updatedOrderItemVariations) {
					let hasNonRabatt = variation.variationItems.some(vi => vi.name !== "Rabatt");
					if (hasNonRabatt) {
						totalCount += variation.count
					}
				}
				targetOrderItem.count = totalCount
				
				// Entferne das OrderItem wenn count = 0
				if (targetOrderItem.count <= 0) {
					this.selectedMenuItem.orderItems = this.selectedMenuItem.orderItems.filter(item => 
						item.uuid !== targetOrderItem.uuid
					);
				}
				
				// Entferne das gesamte MenuOrderItem wenn keine OrderItems mehr vorhanden
				if (this.selectedMenuItem.orderItems.length === 0) {
					this.stagedItems.deleteMenuItem(this.selectedMenuItem);
				} else {
					// Aktualisiere MenuOrderItem count basierend auf verbleibenden OrderItems
					this.selectedMenuItem.count = this.selectedMenuItem.orderItems.reduce((sum, item) => sum + item.count, 0);
				}
			}
			
		} else if (this.selectedItem != null) {
			// Normale OrderItem-Behandlung (bleibt wie vorher)
			this.selectedItem.count = this.tmpSelectedItem.count
			this.selectedItem.orderItemVariations = this.tmpSelectedItem.orderItemVariations

			if (this.tmpAllItemHandler === this.bookedItems) {
				this.sendOrderItem(orderItem)
			}
		}

		// Cleanup (wie in sendVariation)
		this.tmpPickedVariationResource = []
		this.tmpCountVariations = 0
		this.tmpSelectedItem = undefined
		this.selectedMenuItem = null
		this.showTotal();

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
			if (this.isSpecialVariationMode && this.selectedItem && !this.minusUsed) {
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
						this.tmpSpecialAllItemsHandler.pushNewItem(orderItem);
						// Temporär currentSpecial und andere Werte für confirmSpecials setzen
						const originalSpecial = this.currentSpecial;
						this.currentSpecial = this.lastClickedMenuItem.menu;
						this.confirmSpecials();
						this.currentSpecial = originalSpecial;
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
			this.lastClickedMenuItem = null // Reset nach der Verarbeitung
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

	selectMenuItem(pickedItem: MenuOrderItem, AllItemHandler: AllItemHandler) {
		this.selectedMenuItem = pickedItem
		this.tmpAllItemHandler = AllItemHandler
		this.selectedItem = null
	}

	//Füge selektiertes Item hinzu
	addSelectedItem(orderItem: OrderItem | MenuOrderItem) {
		this.clickItem(orderItem.product)
	}

	addSelectedMenuItem(menuItem: MenuOrderItem) {
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

    showMenus() {
    this.menues = this.menuInventory.menus;
    this.specials = [];
	this.selectedInventory = [];
	}

	showSpecials() {
		this.specials = this.menuInventory.specials;
		this.menues = [];
		this.selectedInventory = [];
	}

	clickSpecial(special: Menu) {
		this.currentSpecial = special;
		this.isMenuePopupVisible = true;
		
		for (let item of special.items) {
			for (let category of item.categories) {
				this.specialCategories.push(category);
			}
		}

	}

	changeSelectedSpecialInventory(items: Product[]) {
		this.specialProducts = items;
	}

	closeSpecials() {
		this.isMenuePopupVisible = false;
		this.specialCategories = [];
		this.specialProducts = [];
		this.selectedInventory = [];
		this.currentSpecial = null;
		this.tmpSpecialAllItemsHandler = new AllItemHandler();
		this.lastClickedMenuItem = null; // Reset beim Schließen des Special-Popups
	}

	clickSpecialProduct(product: Product) {
		if (product == null) return

		// Reset lastClickedMenuItem da wir jetzt ein Special-Produkt bearbeiten
		this.lastClickedMenuItem = null;

		let newItem: OrderItem = {
			uuid: product.uuid,
			count: 0,
			order: null,
			product,
			orderItemVariations: []
		}

		if (product.variations.length === 0) {
			// Produkt ohne Variationen - direkt hinzufügen
			if (this.tmpSpecialAllItemsHandler.includes(newItem)) {
				let existingItem = this.tmpSpecialAllItemsHandler.getItem(newItem.product.id)
				existingItem.count += 1
			} else {
				newItem.count = 1
				this.tmpSpecialAllItemsHandler.pushNewItem(newItem)
			}
		} else {
			// Produkt mit Variationen - Special-Variation-Popup öffnen
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

			this.isSpecialVariationPopupVisible = true // Separate Variable für Special-Popup
			this.isSpecialVariationMode = true // Flag für Special-Modus
		}
	}

	addSpecial(item: OrderItem) {
			item.count += 1;
	}

	removeSpecial(item: OrderItem) {
			// Einfaches Item ohne Variationen
			item.count -= 1;
			if (item.count === 0) {
				this.tmpSpecialAllItemsHandler.deleteItem(item);
			}
	}

	editSpecial(item: OrderItem) {
		// Item hat Variationen - öffne Variations-Popup für Bearbeitung
		this.selectedItem = item;
		this.tmpSelectedItem = JSON.parse(JSON.stringify(item)); // Deep copy für Bearbeitung
		this.minusUsed = false; // Edit-Modus, nicht Minus-Modus
		this.lastClickedItem = item.product; // Setze das Produkt für sendVariation
		
		// Initialisiere tmpPickedVariationResource mit den bestehenden Variationen
		this.tmpPickedVariationResource = [];
		this.tmpCountVariations = 0;
		
		// Lade die bestehenden Variationen des Items
		// Verwende die bestehenden Variationen für das Popup
		for (let orderItemVariation of item.orderItemVariations) {
			for (let variationItem of orderItemVariation.variationItems) {
				// Überspringe Rabatt-Items
				if (variationItem.name === "Rabatt") {
					continue;
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
				);
			}
		}
		
		this.isSpecialVariationPopupVisible = true;
		this.isSpecialVariationMode = true;
		this.tmpAllItemHandler = this.tmpSpecialAllItemsHandler;
	}

	confirmSpecials() {
		let rabattFaktor = 0;
		if (this.currentSpecial.discountType === 'PERCENTAGE') {
			rabattFaktor = this.currentSpecial.offerValue / 100;
		}

		// Durch alle ausgewählten Produkte gehen und für jedes ein separates MenuOrderItem erstellen
		for (let item of this.tmpSpecialAllItemsHandler.getAllPickedItems()) {
			
			let processedItem: OrderItem = JSON.parse(JSON.stringify(item));
			let existingVariations = [...processedItem.orderItemVariations];
			let newOrderItemVariations: OrderItemVariation[] = [];
			
			// Füge für jede bestehende OrderItemVariation die Variation und direkt danach den Rabatt hinzu
			for (let orderItemVariation of existingVariations) {
				
				// Füge die ursprüngliche Variation hinzu
				newOrderItemVariations.push(orderItemVariation);

				// Berechne Rabatt für diese Variation
				let sumAdditional = orderItemVariation.variationItems.reduce((acc, vi) => acc + vi.additionalCost, 0);
				let originalCostPerUnit = processedItem.product.price + sumAdditional;
				let rabattBetrag = -(originalCostPerUnit * rabattFaktor);

				let rabattVariation: OrderItemVariation = {
					uuid: crypto.randomUUID(),
					count: orderItemVariation.count,
					variationItems: [{
						id: 0,
						uuid: crypto.randomUUID(),
						name: "Rabatt",
						additionalCost: rabattBetrag,
					}]
				};
				newOrderItemVariations.push(rabattVariation);
			}
			
			// Ersetze die ursprünglichen Variationen mit der neuen sortierten Liste
			processedItem.orderItemVariations = newOrderItemVariations;

			// Für Produkte ohne Variationen: Rabatt direkt auf das Basis-Produkt anwenden
			if (existingVariations.length === 0) {
				let originalCost = processedItem.product.price;
				let rabattBetrag = -(originalCost * rabattFaktor);

				let rabattVariation: OrderItemVariation = {
					uuid: crypto.randomUUID(),
					count: processedItem.count,
					variationItems: [{
						id: 0,
						uuid: crypto.randomUUID(),
						name: "Rabatt",
						additionalCost: rabattBetrag
					}]
				};

				processedItem.orderItemVariations.push(rabattVariation);
			}

			let itemPrice = this.calculateSpecialPrice(processedItem);
			console.log("Item Price:", itemPrice);

			let menuOrderItem: MenuOrderItem = {
				uuid: crypto.randomUUID(),
				count: processedItem.count,
				order: null,
				menu: this.currentSpecial,
				name: this.currentSpecial.name,
				product: {
					id: processedItem.product.id,
					uuid: processedItem.product.uuid,
					name: this.currentSpecial.name,
					price: itemPrice,
					variations: []
				},
				orderItems: [processedItem]
			};
			
			if(this.stagedItems.includesMenuItem(menuOrderItem)) {
				for (let item of this.stagedItems.getAllPickedMenuItems()) {
					for (let orderItem of item.orderItems) {
						if (orderItem.product.id === processedItem.product.id) {
							// Wenn das Produkt übereinstimmt, füge die OrderItemVariationen hinzu
							orderItem.count += processedItem.count;

							// Füge auch die neuen Variationen (inklusive Rabatt) hinzu
							// Neue Logik: paarweise Mergen (Basisvariation gefolgt von Rabatt)
							let isDiscountVar = (v: OrderItemVariation) => v.variationItems.length === 1 && v.variationItems[0].name === 'Rabatt';
							let basesEqual = (a: OrderItemVariation, b: OrderItemVariation) => {
								if (isDiscountVar(a) || isDiscountVar(b)) return false;
								if (a.variationItems.length !== b.variationItems.length) return false;
								for (let i = 0; i < a.variationItems.length; i++) {
									let ai = a.variationItems[i];
									let bi = b.variationItems[i];
									if (ai.name !== bi.name) return false;
									if (ai.additionalCost !== bi.additionalCost) return false;
								}
								return true;
							};

							let idx = 0;
							while (idx < processedItem.orderItemVariations.length) {
								let newVar = processedItem.orderItemVariations[idx];
								if (!isDiscountVar(newVar)) {
									// Basisvariation finden/erstellen
									let baseIdx = orderItem.orderItemVariations.findIndex(ex => basesEqual(ex, newVar));
									if (baseIdx >= 0) {
										orderItem.orderItemVariations[baseIdx].count += newVar.count;
									} else {
										orderItem.orderItemVariations.push({ ...newVar });
										baseIdx = orderItem.orderItemVariations.length - 1;
									}

									// Falls die nächste neue Variation ein Rabatt ist, direkt dahinter mergen/einfügen
									let hasNextDiscount = idx + 1 < processedItem.orderItemVariations.length && isDiscountVar(processedItem.orderItemVariations[idx + 1]);
									if (hasNextDiscount) {
										let newDisc = processedItem.orderItemVariations[idx + 1];
										let expectedDiscCost = newDisc.variationItems[0].additionalCost;

										if (
											baseIdx + 1 < orderItem.orderItemVariations.length &&
											isDiscountVar(orderItem.orderItemVariations[baseIdx + 1]) &&
											orderItem.orderItemVariations[baseIdx + 1].variationItems[0].additionalCost === expectedDiscCost
										) {
											orderItem.orderItemVariations[baseIdx + 1].count += newDisc.count;
										} else {
											orderItem.orderItemVariations.splice(baseIdx + 1, 0, { ...newDisc });
										}
										idx += 2;
									} else {
										idx += 1;
									}
								} else {
									// Standalone-Rabatt (z. B. Produkt ohne Variationen)
									let expectedDiscCost = newVar.variationItems[0].additionalCost;
									let existingDiscIdx = orderItem.orderItemVariations.findIndex(ex => isDiscountVar(ex) && ex.variationItems[0].additionalCost === expectedDiscCost);
									if (existingDiscIdx >= 0) {
										orderItem.orderItemVariations[existingDiscIdx].count += newVar.count;
									} else {
										orderItem.orderItemVariations.push({ ...newVar });
									}
									idx += 1;
								}
							}
						}
					}
					
					// Aktualisiere den Gesamtpreis des MenuItems
					let totalPrice = 0;
					for (let orderItem of item.orderItems) {
						totalPrice += this.calculateSpecialPrice(orderItem);
					}
					item.product.price = totalPrice;
				}
			} else {
				this.stagedItems.pushNewMenuItem(menuOrderItem);
			}
		}

		// Cleanup
		this.isMenuePopupVisible = false;
		this.specialCategories = [];
		this.specialProducts = [];
		this.selectedInventory = [];
		this.currentSpecial = null;
		this.tmpSpecialAllItemsHandler = new AllItemHandler();
		this.showTotal();
	}

	calculateSpecialPrice(item: OrderItem): number {
		let originalPrice = item.product.price * item.count;
		
		for (let variation of item.orderItemVariations) {
			for (let variationItem of variation.variationItems) {
				if (variationItem.name !== "Rabatt") {
					originalPrice += variation.count * variationItem.additionalCost;
				}
			}
		}

		let itemPrice = originalPrice;

		switch (this.currentSpecial.offerType) {
			case 'FIXED_PRICE':
				itemPrice = this.currentSpecial.offerValue;
				break;
			case 'DISCOUNT':
				if (this.currentSpecial.discountType === 'PERCENTAGE') {
					itemPrice = originalPrice * (1 - (this.currentSpecial.offerValue / 100));
				} else if (this.currentSpecial.discountType === 'AMOUNT') {
					itemPrice = originalPrice - this.currentSpecial.offerValue;
				}
				break;
			default:
				itemPrice = originalPrice;
				break;
		}
		
		return itemPrice;
	}
}