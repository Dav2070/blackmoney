import { Component, OnInit, ViewChild, ElementRef } from "@angular/core"
import { Category } from "src/app/models/Category"
import { Menu } from "src/app/models/Menu"
import { Product } from "src/app/models/Product"
import { OrderItem } from "src/app/models/OrderItem"
import { ProductType, OrderItemType } from "src/app/types"
import { formatPrice } from "src/app/utils"
import { faPlus, faMinus, faTrash } from "@fortawesome/pro-regular-svg-icons"
import { faChevronLeft, faChevronRight } from "@fortawesome/pro-solid-svg-icons"
import { SelectMenuSpecialProductsDialogComponent } from "src/app/dialogs/select-menu-special-products-dialog/select-menu-special-products-dialog.component"
import { SelectProductVariationsDialogComponent } from "src/app/dialogs/select-product-variations-dialog/select-product-variations-dialog.component"
import { AddNoteDialogComponent } from "src/app/dialogs/add-note-dialog/add-note-dialog.component"
import { ConfirmOrderDialogComponent } from "src/app/dialogs/confirm-order-dialog/confirm-order-dialog.component"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	templateUrl: "./landing-order-page.component.html",
	styleUrl: "./landing-order-page.component.scss",
	standalone: false
})
export class LandingOrderPageComponent implements OnInit {
	locale = this.localizationService.locale.landingOrderPage
	faPlus = faPlus
	faMinus = faMinus
	faTrash = faTrash
	faChevronLeft = faChevronLeft
	faChevronRight = faChevronRight
	formatPrice = formatPrice

	menu: Menu
	selectedCategory: Category | null = null
	cartItems: OrderItem[] = []
	selectedProduct: Product = null

	//#region SelectProductSpecialDialog variables
	@ViewChild("selectMenuSpecialProductsDialog")
	selectMenuSpecialProductsDialog: SelectMenuSpecialProductsDialogComponent
	//#endregion
	//#region SelectProductVariationsDialog variables
	@ViewChild("selectProductVariationsDialog")
	selectProductVariationsDialog: SelectProductVariationsDialogComponent
	//#endregion
	//#region AddNoteDialog variables
	@ViewChild("addNoteDialog")
	addNoteDialog: AddNoteDialogComponent
	selectedOrderItem: OrderItem = null
	//#endregion
	//#region ConfirmOrderDialog variables
	@ViewChild("confirmOrderDialog")
	confirmOrderDialog: ConfirmOrderDialogComponent
	//#endregion
	//#region Tab-Bar Navigation
	@ViewChild("categoryTabBar", { read: ElementRef })
	categoryTabBar: ElementRef
	//#endregion

	constructor(private localizationService: LocalizationService) {}

	get offerProducts(): Product[] {
		if (!this.menu?.categories) return []
		return this.menu.categories
			.flatMap(cat => cat.products)
			.filter(
				product => product.offer && this.isOfferAvailable(product.offer)
			)
	}

	isOfferAvailable(offer: any): boolean {
		const now = new Date()
		const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, ...
		const currentTime = now.getHours() * 60 + now.getMinutes()

		// Map JavaScript day (0-6) to weekday strings
		const dayMap = [
			"SUNDAY",
			"MONDAY",
			"TUESDAY",
			"WEDNESDAY",
			"THURSDAY",
			"FRIDAY",
			"SATURDAY"
		]
		const currentWeekday = dayMap[currentDay]

		// Check weekdays
		if (offer.weekdays && offer.weekdays.length > 0) {
			if (!offer.weekdays.includes(currentWeekday)) {
				return false
			}
		}

		// Check date range
		if (offer.startDate) {
			const startDate = new Date(offer.startDate)
			startDate.setHours(0, 0, 0, 0)
			if (now < startDate) {
				return false
			}
		}

		if (offer.endDate) {
			const endDate = new Date(offer.endDate)
			endDate.setHours(23, 59, 59, 999)
			if (now > endDate) {
				return false
			}
		}

		// Check time range
		if (offer.startTime) {
			const [startHour, startMin] = offer.startTime.split(":").map(Number)
			const startTimeMinutes = startHour * 60 + startMin
			if (currentTime < startTimeMinutes) {
				return false
			}
		}

		if (offer.endTime) {
			const [endHour, endMin] = offer.endTime.split(":").map(Number)
			const endTimeMinutes = endHour * 60 + endMin
			if (currentTime > endTimeMinutes) {
				return false
			}
		}

		return true
	}

	ngOnInit() {
		// Mock-Daten für die Kategorien mit Produkten
		this.menu = {
			uuid: "mock-menu-uuid",
			categories: [
				{
					uuid: "cat-1",
					name: "Vorspeisen",
					products: [
						{
							uuid: "prod-1",
							type: "PRODUCT" as ProductType,
							name: "Bruschetta",
							price: 650,
							shortcut: 1,
							variations: [],
							takeaway: false
						},
						{
							uuid: "prod-2",
							type: "PRODUCT" as ProductType,
							name: "Caprese",
							price: 750,
							shortcut: 2,
							variations: [],
							takeaway: false
						},
						{
							uuid: "prod-3",
							type: "PRODUCT" as ProductType,
							name: "Antipasti Misti",
							price: 850,
							shortcut: 3,
							variations: [],
							takeaway: false
						},
						{
							uuid: "prod-4",
							type: "PRODUCT" as ProductType,
							name: "Carpaccio",
							price: 950,
							shortcut: 4,
							variations: [],
							takeaway: false
						},
						{
							uuid: "prod-5",
							type: "PRODUCT" as ProductType,
							name: "Vitello Tonnato",
							price: 1050,
							shortcut: 5,
							variations: [],
							takeaway: false
						}
					]
				},
				{
					uuid: "cat-2",
					name: "Hauptgerichte",
					products: [
						{
							uuid: "prod-10",
							type: "PRODUCT" as ProductType,
							name: "Lasagne",
							price: 1250,
							shortcut: 10,
							variations: [],
							takeaway: false
						},
						{
							uuid: "prod-11",
							type: "PRODUCT" as ProductType,
							name: "Scaloppine",
							price: 1450,
							shortcut: 11,
							variations: [],
							takeaway: false
						},
						{
							uuid: "prod-12",
							type: "PRODUCT" as ProductType,
							name: "Ossobuco",
							price: 1650,
							shortcut: 12,
							variations: [],
							takeaway: false
						},
						{
							uuid: "prod-13",
							type: "PRODUCT" as ProductType,
							name: "Saltimbocca",
							price: 1550,
							shortcut: 13,
							variations: [],
							takeaway: false
						}
					]
				},
				{
					uuid: "cat-3",
					name: "Pizza",
					products: [
						{
							uuid: "prod-20",
							type: "PRODUCT" as ProductType,
							name: "Margherita",
							price: 850,
							shortcut: 20,
							variations: [
								{
									uuid: "var-pizza-size",
									name: "Größe",
									variationItems: [
										{
											id: 1,
											uuid: "vi-1",
											name: "Klein (26cm)",
											additionalCost: 0
										},
										{
											id: 2,
											uuid: "vi-2",
											name: "Mittel (30cm)",
											additionalCost: 250
										},
										{
											id: 3,
											uuid: "vi-3",
											name: "Groß (36cm)",
											additionalCost: 400
										}
									]
								},
								{
									uuid: "var-pizza-extras",
									name: "Extras",
									variationItems: [
										{
											id: 4,
											uuid: "vi-4",
											name: "Extra Käse",
											additionalCost: 150
										},
										{
											id: 5,
											uuid: "vi-5",
											name: "Knoblauch",
											additionalCost: 0
										},
										{
											id: 6,
											uuid: "vi-6",
											name: "Scharf",
											additionalCost: 0
										},
										{
											id: 7,
											uuid: "vi-7",
											name: "Oliven",
											additionalCost: 100
										}
									]
								}
							],
							takeaway: false
						},
						{
							uuid: "prod-21",
							type: "PRODUCT" as ProductType,
							name: "Salami",
							price: 950,
							shortcut: 21,
							variations: [],
							takeaway: false
						},
						{
							uuid: "prod-22",
							type: "PRODUCT" as ProductType,
							name: "Prosciutto",
							price: 950,
							shortcut: 22,
							variations: [],
							takeaway: false
						},
						{
							uuid: "prod-23",
							type: "PRODUCT" as ProductType,
							name: "Funghi",
							price: 950,
							shortcut: 23,
							variations: [],
							takeaway: false
						},
						{
							uuid: "prod-24",
							type: "PRODUCT" as ProductType,
							name: "Quattro Stagioni",
							price: 1050,
							shortcut: 24,
							variations: [],
							takeaway: false
						},
						{
							uuid: "prod-25",
							type: "MENU" as ProductType,
							name: "Diavola",
							price: 1050,
							shortcut: 25,
							variations: [],
							takeaway: false,
							offer: {
								id: 1,
								uuid: "offer-1",
								offerType: "FIXED_PRICE",
								offerValue: 1500,
								weekdays: [
									"MONDAY",
									"TUESDAY",
									"WEDNESDAY",
									"THURSDAY",
									"FRIDAY",
									"SATURDAY",
									"SUNDAY"
								],
								offerItems: [
									{
										uuid: "oi-1",
										name: "Pizza",
										maxSelections: 1,
										products: [
											{
												uuid: "prod-25",
												type: "PRODUCT" as ProductType,
												name: "Diavola",
												price: 1050,
												shortcut: 25,
												category: {
													uuid: "cat-3",
													name: "Pizza",
													products: []
												},
												variations: []
											},
											{
												uuid: "prod-26",
												type: "PRODUCT" as ProductType,
												name: "Hawaii",
												price: 1050,
												shortcut: 26,
												category: {
													uuid: "cat-3",
													name: "Pizza",
													products: []
												},
												variations: []
											},
											{
												uuid: "prod-27",
												type: "PRODUCT" as ProductType,
												name: "Tuna",
												price: 1050,
												shortcut: 27,
												category: {
													uuid: "cat-3",
													name: "Pizza",
													products: []
												},
												variations: []
											}
										]
									},
									{
										uuid: "oi-2",
										name: "Getränk",
										maxSelections: 1,
										products: [
											{
												uuid: "prod-60",
												type: "PRODUCT" as ProductType,
												name: "Cola",
												price: 350,
												shortcut: 60,
												category: {
													uuid: "cat-7",
													name: "Getränke",
													products: []
												},
												variations: [
													//Klein Gross
													{
														uuid: "var-coke-size",
														name: "Größe",
														variationItems: [
															{
																id: 8,
																uuid: "vi-8",
																name: "Klein",
																additionalCost: 0
															},
															{
																id: 9,
																uuid: "vi-9",
																name: "Groß",
																additionalCost: 150
															}
														]
													}
												]
											},
											{
												uuid: "prod-61",
												type: "PRODUCT" as ProductType,
												name: "Wasser",
												price: 250,
												shortcut: 61,
												category: {
													uuid: "cat-7",
													name: "Getränke",
													products: []
												},
												variations: []
											}
										]
									}
								]
							}
						}
					]
				},
				{
					uuid: "cat-4",
					name: "Pasta",
					products: [
						{
							uuid: "prod-30",
							type: "PRODUCT" as ProductType,
							name: "Spaghetti Carbonara",
							price: 1150,
							shortcut: 30,
							variations: [
								{
									uuid: "var-pasta-portion",
									name: "Portion",
									variationItems: [
										{
											id: 10,
											uuid: "vi-10",
											name: "Normal",
											additionalCost: 0
										},
										{
											id: 11,
											uuid: "vi-11",
											name: "Groß",
											additionalCost: 300
										}
									]
								}
							],
							takeaway: false
						},
						{
							uuid: "prod-31",
							type: "PRODUCT" as ProductType,
							name: "Penne Arrabbiata",
							price: 1050,
							shortcut: 31,
							variations: [],
							takeaway: false
						},
						{
							uuid: "prod-32",
							type: "PRODUCT" as ProductType,
							name: "Tagliatelle al Ragù",
							price: 1250,
							shortcut: 32,
							variations: [],
							takeaway: false
						},
						{
							uuid: "prod-33",
							type: "PRODUCT" as ProductType,
							name: "Gnocchi Gorgonzola",
							price: 1150,
							shortcut: 33,
							variations: [],
							takeaway: false
						}
					]
				},
				{
					uuid: "cat-5",
					name: "Salate",
					products: [
						{
							uuid: "prod-40",
							type: "PRODUCT" as ProductType,
							name: "Insalata Mista",
							price: 650,
							shortcut: 40,
							variations: [],
							takeaway: false
						},
						{
							uuid: "prod-41",
							type: "PRODUCT" as ProductType,
							name: "Caesar Salad",
							price: 850,
							shortcut: 41,
							variations: [],
							takeaway: false
						},
						{
							uuid: "prod-42",
							type: "PRODUCT" as ProductType,
							name: "Rucola e Parmigiano",
							price: 750,
							shortcut: 42,
							variations: [],
							takeaway: false
						}
					]
				},
				{
					uuid: "cat-6",
					name: "Desserts",
					products: [
						{
							uuid: "prod-50",
							type: "PRODUCT" as ProductType,
							name: "Tiramisu",
							price: 550,
							shortcut: 50,
							variations: [],
							takeaway: false
						},
						{
							uuid: "prod-51",
							type: "PRODUCT" as ProductType,
							name: "Panna Cotta",
							price: 450,
							shortcut: 51,
							variations: [],
							takeaway: false
						},
						{
							uuid: "prod-52",
							type: "PRODUCT" as ProductType,
							name: "Gelato Misto",
							price: 500,
							shortcut: 52,
							variations: [],
							takeaway: false
						}
					]
				},
				{
					uuid: "cat-7",
					name: "Getränke",
					products: [
						{
							uuid: "prod-60",
							type: "PRODUCT" as ProductType,
							name: "Coca Cola",
							price: 350,
							shortcut: 60,
							variations: [],
							takeaway: false
						},
						{
							uuid: "prod-61",
							type: "PRODUCT" as ProductType,
							name: "Wasser",
							price: 250,
							shortcut: 61,
							variations: [],
							takeaway: false
						},
						{
							uuid: "prod-62",
							type: "PRODUCT" as ProductType,
							name: "Espresso",
							price: 250,
							shortcut: 62,
							variations: [],
							takeaway: false
						},
						{
							uuid: "prod-63",
							type: "PRODUCT" as ProductType,
							name: "Cappuccino",
							price: 350,
							shortcut: 63,
							variations: [
								{
									uuid: "var-cappuccino-size",
									name: "Größe",
									variationItems: [
										{
											id: 12,
											uuid: "vi-12",
											name: "Normal",
											additionalCost: 0
										},
										{
											id: 13,
											uuid: "vi-13",
											name: "Groß",
											additionalCost: 100
										}
									]
								},
								{
									uuid: "var-cappuccino-milk",
									name: "Milch",
									variationItems: [
										{
											id: 14,
											uuid: "vi-14",
											name: "Kuhmilch",
											additionalCost: 0
										},
										{
											id: 15,
											uuid: "vi-15",
											name: "Hafermilch",
											additionalCost: 50
										},
										{
											id: 16,
											uuid: "vi-16",
											name: "Sojamilch",
											additionalCost: 50
										}
									]
								}
							],
							takeaway: false
						}
					]
				},
				{
					uuid: "cat-8",
					name: "Alkoholische Getränke",
					products: [
						{
							uuid: "prod-70",
							type: "PRODUCT" as ProductType,
							name: "Bier",
							price: 450,
							shortcut: 70,
							variations: [],
							takeaway: false
						},
						{
							uuid: "prod-71",
							type: "PRODUCT" as ProductType,
							name: "Wein",
							price: 600,
							shortcut: 71,
							variations: [],
							takeaway: false
						}
					]
				}
			],
			variations: [],
			offers: []
		} as Menu

		// Wähle die erste Kategorie als Standard
		if (this.menu.categories.length > 0) {
			this.selectedCategory = this.menu.categories[0]
		}
	}

	selectCategory(category: Category) {
		this.selectedCategory = category

		// Scrolle zur Kategorie im Content
		const element = document.getElementById(`category-${category.uuid}`)
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "start" })
		}

		// Scrolle das Tab-Item in der Tab-Bar in die Sichtbarkeit
		setTimeout(() => {
			if (!this.categoryTabBar?.nativeElement) return
			const tabBar =
				this.categoryTabBar.nativeElement.querySelector("dav-tab-bar")
			if (!tabBar) return

			// Finde den Index der aktuellen Kategorie
			const allCats = this.allCategories
			const categoryIndex = allCats.findIndex(
				cat => cat.uuid === category.uuid
			)
			if (categoryIndex === -1) return

			// Hole alle Tab-Items
			const tabItems = tabBar.querySelectorAll("dav-tab-bar-item")
			if (!tabItems || tabItems.length === 0) return

			const targetTab = tabItems[categoryIndex]
			if (!targetTab) return

			// Scrolle das Tab in die Sichtbarkeit
			const tabBarRect = tabBar.getBoundingClientRect()
			const tabRect = targetTab.getBoundingClientRect()

			// Scrolle das Tab in die Mitte der Tab-Bar
			const scrollLeft =
				tabBar.scrollLeft +
				(tabRect.left - tabBarRect.left) -
				tabBarRect.width / 2 +
				tabRect.width / 2
			tabBar.scrollTo({ left: scrollLeft, behavior: "smooth" })
		}, 100)
	}

	get allCategories(): Category[] {
		const categories: Category[] = []
		if (this.offerProducts.length > 0) {
			categories.push({
				uuid: "offers",
				name: "Angebote",
				products: this.offerProducts
			})
		}
		if (this.menu?.categories) {
			categories.push(...this.menu.categories)
		}
		return categories
	}

	get canNavigatePrevious(): boolean {
		if (!this.categoryTabBar?.nativeElement) return false
		const element =
			this.categoryTabBar.nativeElement.querySelector("dav-tab-bar")
		if (!element) return false
		return element.scrollLeft > 0
	}

	get canNavigateNext(): boolean {
		if (!this.categoryTabBar?.nativeElement) return false
		const element =
			this.categoryTabBar.nativeElement.querySelector("dav-tab-bar")
		if (!element) return false
		return element.scrollLeft < element.scrollWidth - element.clientWidth - 1
	}

	navigatePrevious() {
		if (!this.categoryTabBar?.nativeElement) return
		const element =
			this.categoryTabBar.nativeElement.querySelector("dav-tab-bar")
		if (!element) return
		element.scrollBy({ left: -200, behavior: "smooth" })
	}

	navigateNext() {
		if (!this.categoryTabBar?.nativeElement) return
		const element =
			this.categoryTabBar.nativeElement.querySelector("dav-tab-bar")
		if (!element) return
		element.scrollBy({ left: 200, behavior: "smooth" })
	}

	// Füge item zu cartItems hinzu (1:1 von booking-page)
	clickItem(product: Product) {
		if (product == null) return
		console.log("clickItem called with product:", product)
		this.selectedProduct = product

		if (product.type === "SPECIAL") {
			console.log("Opening SPECIAL dialog")
			this.selectedProduct = product
			this.selectMenuSpecialProductsDialog.show()
		} else if (product.type === "MENU") {
			console.log("Opening MENU dialog")
			this.selectedProduct = JSON.parse(JSON.stringify(product))
			this.selectMenuSpecialProductsDialog.show()
		} else {
			console.log("Normal product, variations:", product.variations?.length)
			let newItem: OrderItem = {
				uuid: crypto.randomUUID(),
				type: OrderItemType.Product,
				count: 0,
				order: null,
				product,
				orderItems: [],
				orderItemVariations: []
			}

			if (product.variations.length === 0) {
				console.log("No variations, adding to cart")
				// Prüfe ob Produkt bereits im Warenkorb ist
				const existingItem = this.cartItems.find(
					item => item.product.uuid === product.uuid
				)

				if (existingItem) {
					existingItem.count++
				} else {
					newItem.count = 1
					this.cartItems.push(newItem)
				}
			} else {
				console.log(
					"Has variations, opening dialog",
					this.selectProductVariationsDialog
				)
				this.selectProductVariationsDialog.show()
			}
		}
	}

	increaseQuantity(item: OrderItem) {
		item.count++
	}

	decreaseQuantity(item: OrderItem) {
		if (item.count > 1) {
			item.count--
		} else {
			this.removeFromCart(item)
		}
	}

	removeFromCart(item: OrderItem) {
		const index = this.cartItems.findIndex(i => i.uuid === item.uuid)
		if (index > -1) {
			this.cartItems.splice(index, 1)
		}
	}

	openAddNoteDialog(item: OrderItem) {
		this.selectedOrderItem = item
		this.addNoteDialog.orderItem = item
		this.addNoteDialog.show()
	}

	addNoteDialogPrimaryButtonClick(event: { note: string }) {
		if (this.selectedOrderItem) {
			this.selectedOrderItem.notes = event.note
		}
	}

	getCartTotal(): number {
		return this.cartItems.reduce(
			(total, item) => total + item.product.price * item.count,
			0
		)
	}

	submitOrder() {
		this.confirmOrderDialog.totalPrice = this.getCartTotal()
		this.confirmOrderDialog.show()
	}

	confirmOrderDialogConfirmOrder(event: {
		deliveryType: "DELIVERY" | "PICKUP"
		paymentMethod: "CASH" | "CARD"
	}) {
		console.log("Order confirmed:", event)
		// Hier würde die Logik zum Absenden der Bestellung implementiert werden
		// Warenkorb leeren
		this.cartItems = []
	}

	selectMenuSpecialProductsDialogPrimaryButtonClick(event: {
		orderItems: OrderItem[]
	}) {
		const orderItemType =
			this.selectedProduct.type === "MENU"
				? OrderItemType.Menu
				: OrderItemType.Special

		const newItem: OrderItem = {
			uuid: crypto.randomUUID(),
			type: orderItemType,
			count: 1,
			order: null,
			product: this.selectedProduct,
			orderItems: event.orderItems,
			orderItemVariations: []
		}

		this.cartItems.push(newItem)
		this.selectMenuSpecialProductsDialog.hide()
	}

	selectProductVariationsDialogPrimaryButtonClick(event: {
		variationTree: { [key: string]: number }[]
	}) {
		const lastVariationTree = event.variationTree.pop()
		const allVariationItems = this.selectedProduct.variations
			.map(v => v.variationItems)
			.flat()

		const newItem: OrderItem = {
			uuid: crypto.randomUUID(),
			type: OrderItemType.Product,
			count: 1,
			order: null,
			product: this.selectedProduct,
			orderItems: [],
			orderItemVariations: []
		}

		for (const key of Object.keys(lastVariationTree)) {
			const value = lastVariationTree[key]
			if (value === 0) continue

			const variationItems: any[] = []

			for (const variationItemUuid of key.split(",")) {
				const variationItem = allVariationItems.find(
					vi => vi.uuid === variationItemUuid
				)
				if (variationItem) variationItems.push(variationItem)
			}

			newItem.orderItemVariations.push({
				uuid: crypto.randomUUID(),
				count: value,
				variationItems
			})
		}

		this.cartItems.push(newItem)
		this.selectProductVariationsDialog.hide()
	}
}
