import {
	Component,
	Inject,
	PLATFORM_ID,
	ViewChild,
	HostListener,
	ElementRef
} from "@angular/core"
import { isPlatformServer } from "@angular/common"
import { Router, ActivatedRoute, ParamMap } from "@angular/router"
import {
	faArrowRightArrowLeft,
	faFileLines,
	faXmark,
	faMinus,
	faPlus,
	faComma,
	faCreditCard,
	faPaperPlaneTop,
	faArrowTurnDownRight,
	faCupTogo,
	faNoteSticky,
	faStar,
	faSeat,
	faUtensils
} from "@fortawesome/pro-regular-svg-icons"
import { BottomSheet } from "dav-ui-components"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { Category } from "src/app/models/Category"
import { Product } from "src/app/models/Product"
import { OrderItem } from "src/app/models/OrderItem"
import { Table } from "src/app/models/Table"
import { Room } from "src/app/models/Room"
import { VariationItem } from "src/app/models/VariationItem"
import { Order } from "src/app/models/Order"
import { AddProductsInput, OrderItemType } from "src/app/types"
import { BillsOverviewDialogComponent } from "src/app/dialogs/bills-overview-dialog/bills-overview-dialog.component"
import { SelectTableDialogComponent } from "src/app/dialogs/select-table-dialog/select-table-dialog.component"
import { SelectProductDialogComponent } from "src/app/dialogs/select-product-dialog/select-product-dialog.component"
import { SelectMenuSpecialProductsDialogComponent } from "src/app/dialogs/select-menu-special-products-dialog/select-menu-special-products-dialog.component"
import { SelectProductVariationsDialogComponent } from "src/app/dialogs/select-product-variations-dialog/select-product-variations-dialog.component"
import { SubtractProductVariationsDialogComponent } from "src/app/dialogs/subtract-product-variations-dialog/subtract-product-variations-dialog.component"
import { AddNoteDialogComponent } from "src/app/dialogs/add-note-dialog/add-note-dialog.component"
import { ViewNoteDialogComponent } from "src/app/dialogs/view-note-dialog/view-note-dialog.component"
import { digitKeyRegex, numpadKeyRegex } from "src/app/constants"
import {
	calculateTotalPriceOfOrderItem,
	convertCategoryResourceToCategory,
	convertOrderItemResourceToOrderItem,
	convertOrderResourceToOrder,
	formatPrice,
	showToast
} from "src/app/utils"
import { AllItemHandler } from "src/app/models/cash-register/order-item-handling/all-item-handler.model"
import { ApiService } from "src/app/services/api-service"

const mobileBreakpoint = 860

@Component({
	templateUrl: "./booking-page.component.html",
	styleUrl: "./booking-page.component.scss",
	standalone: false
})
export class BookingPageComponent {
	locale = this.localizationService.locale.bookingPage
	faArrowRightArrowLeft = faArrowRightArrowLeft
	faFileLines = faFileLines
	faXmark = faXmark
	faMinus = faMinus
	faPlus = faPlus
	faComma = faComma
	faCreditCard = faCreditCard
	faPaperPlaneTop = faPaperPlaneTop
	faArrowTurnDownRight = faArrowTurnDownRight
	faCupTogo = faCupTogo
	faNoteSticky = faNoteSticky
	faStar = faStar
	faSeat = faSeat
	faUtensils = faUtensils
	calculateTotalPriceOfOrderItem = calculateTotalPriceOfOrderItem
	formatPrice = formatPrice
	OrderItemType = OrderItemType
	categories: Category[] = []
	selectedInventory: Product[] = []
	selectedCategory: string = ""
	productsLoading: boolean = true
	ordersLoading: boolean = true
	sendOrderLoading: boolean = false

	bookedItems = new AllItemHandler()
	stagedItems = new AllItemHandler()

	console: string = "0,00 €"
	consoleActive: boolean = false

	commaUsed: boolean = false
	uuid: string = null
	room: Room = null
	table: Table = null
	orderUuid: string = null
	billUuid: string = null

	xUsed: boolean = false
	tmpAnzahl = 0

	selectedOrderItem: OrderItem = null
	selectedProduct: Product = null
	tmpAllItemHandler: AllItemHandler = null
	bills: Order[] = []

	@ViewChild("ordersContainer")
	ordersContainer: ElementRef<HTMLDivElement>

	//#region BillsOverviewDialog variables
	@ViewChild("billsOverviewDialog")
	billsOverviewDialog: BillsOverviewDialogComponent
	//#endregion

	//#region SelectTableDialog variables
	@ViewChild("selectTableDialog")
	selectTableDialog: SelectTableDialogComponent
	//#endregion

	//#region SelectProductDialog variables
	@ViewChild("selectProductDialog")
	selectProductDialog: SelectProductDialogComponent
	//#endregion

	//#region SelectProductSpecialDialog variables
	@ViewChild("selectMenuSpecialProductsDialog")
	selectMenuSpecialProductsDialog: SelectMenuSpecialProductsDialogComponent
	//#endregion

	//#region SelectProductVariationsDialog variables
	@ViewChild("selectProductVariationsDialog")
	selectProductVariationsDialog: SelectProductVariationsDialogComponent
	//#endregion

	//#region SubtractProductVariationsDialog variables
	@ViewChild("subtractProductVariationsDialog")
	subtractProductVariationsDialog: SubtractProductVariationsDialogComponent
	//#endregion

	//#region BottomSheet variables
	@ViewChild("bottomSheet", { static: true })
	bottomSheet: ElementRef<BottomSheet>
	touchStartY = 0
	touchDiffY = 0
	swipeStart = false
	startPosition = 0
	//#endregion

	//#region AddNoteDialog
	@ViewChild("addNoteDialog")
	addNoteDialog: AddNoteDialogComponent
	//#endregion

	//#region ViewNoteDialog
	@ViewChild("viewNoteDialog")
	viewNoteDialog: ViewNoteDialogComponent
	//#endregion

	constructor(
		public dataService: DataService,
		private apiService: ApiService,
		private localizationService: LocalizationService,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		@Inject(PLATFORM_ID) private platformId: object
	) {}

	async ngOnInit() {
		if (isPlatformServer(this.platformId)) return

		await this.dataService.blackmoneyUserPromiseHolder.AwaitResult()
		await this.dataService.restaurantPromiseHolder.AwaitResult()

		this.activatedRoute.paramMap.subscribe(async (paramMap: ParamMap) => {
			const uuid = paramMap.get("uuid")

			if (this.uuid !== uuid) {
				this.uuid = uuid

				await this.loadTable()
				await this.loadOrders()
			}
		})

		this.showTotal()

		let retrieveRestaurantResponse = await this.apiService.retrieveRestaurant(
			`
				menu {
					categories {
						items {
							uuid
							name
							products {
								total
								items {
									id
									uuid
									type
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
													id
													uuid
													name
													additionalCost
												}
											}
										}
									}
									offer {
										id
										uuid
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
												products {
													items {
														id
														uuid
														name
														price
														category {
															uuid
															name
															products {
																items {
																id
																	uuid
																	name
																	price
																}
															}
														}
														variations {
															total
															items {
																uuid
																name
																variationItems {
																	total
																	items {
																		id
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
									}
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
		if (categories == null) return
		this.categories = []

		for (const categoryResource of categories) {
			this.categories.push(
				convertCategoryResourceToCategory(categoryResource)
			)
		}

		if (this.categories.length > 0) {
			this.selectCategory(this.categories[0])
		}

		this.showTotal()
		this.productsLoading = false
		this.bottomSheet.nativeElement.snap()
	}

	@HostListener("window:keydown", ["$event"])
	async onKeyDown(event: KeyboardEvent) {
		if (digitKeyRegex.test(event.code) || numpadKeyRegex.test(event.code)) {
			const digit = event.code.replace("Digit", "").replace("Numpad", "")
			this.consoleInput(digit)
		} else if (event.code === "Comma" || event.code === "NumpadDecimal") {
			this.consoleInput(",")
		} else if (event.code === "NumpadAdd") {
			this.consoleInput("+")
		} else if (event.code === "NumpadSubtract") {
			this.consoleInput("-")
		} else if (event.code === "NumpadMultiply") {
			this.consoleInput("*")
		} else if (event.code === "Enter" || event.code === "NumpadEnter") {
			this.bookById()
		} else if (event.code === "Escape") {
			this.showTotal()
		}
	}

	// Lade Items zur ausgewählten Kategorie
	selectCategory(category: Category) {
		this.selectedCategory = category.uuid
		this.selectedInventory = category.products
	}

	navigateToDashboard(event: MouseEvent) {
		event.preventDefault()
		this.router.navigate(["dashboard"])
	}

	selectTableButtonClick() {
		this.selectTableDialog.show()
	}

	async navigateToPaymentPage(event: MouseEvent) {
		event.preventDefault()
		await this.hideBottomSheet()
		this.router.navigate(["dashboard", "tables", this.uuid, "payment"])
	}

	selectTableDialogPrimaryButtonClick(event: { uuid: string }) {
		this.selectTableDialog.hide()
		this.router.navigate(["dashboard", "tables", event.uuid])
	}

	showSelectProductDialog() {
		this.selectProductDialog.show()
	}

	async hideBottomSheet() {
		if (window.outerWidth <= mobileBreakpoint) {
			await this.bottomSheet.nativeElement.snap("bottom")
		}
	}

	handleTouch(event: TouchEvent) {
		if (event.touches.length > 1 || window["visualViewport"].scale > 1.001) {
			return
		}

		const ordersContainer = this.ordersContainer.nativeElement

		if (ordersContainer.contains(event.target as Node)) {
			const scrolledToEnd =
				ordersContainer.scrollTop + ordersContainer.clientHeight >=
				ordersContainer.scrollHeight - 1

			if (!scrolledToEnd) return
		}

		if (event.type === "touchstart") {
			this.touchStartY = event.touches.item(0).screenY
			this.swipeStart = true
		} else if (event.type === "touchmove") {
			this.touchDiffY = this.touchStartY - event.touches.item(0).screenY

			if (this.swipeStart) {
				this.startPosition = this.bottomSheet.nativeElement.position
				this.swipeStart = false
			}

			this.bottomSheet.nativeElement.setPosition(
				this.touchDiffY + this.startPosition
			)
		} else if (event.type === "touchend") {
			this.touchStartY = 0
			this.touchDiffY = 0
			this.startPosition = 0

			this.bottomSheet.nativeElement.snap()
		}
	}

	// Füge item zu stagedItems hinzu
	clickItem(product: Product, note?: string) {
		if (product == null) return
		this.selectedOrderItem = null
		this.selectedProduct = product

		if (product.type === "SPECIAL") {
			this.selectedProduct = product
			this.selectMenuSpecialProductsDialog.show()
		} else if (product.type === "MENU") {
			this.selectedProduct = JSON.parse(JSON.stringify(product))
			this.selectMenuSpecialProductsDialog.show()
		} else {
			let newItem: OrderItem = {
				uuid: crypto.randomUUID(),
				type: OrderItemType.Product,
				count: 0,
				order: null,
				product,
				orderItems: [],
				orderItemVariations: [],
				notes: note
			}

			if (product.variations.length === 0) {
				newItem.count = this.tmpAnzahl > 0 ? this.tmpAnzahl : 1

				this.stagedItems.pushNewItem(newItem)
				this.showTotal()
			} else {
				this.selectedProduct = product
				this.selectProductVariationsDialog.show()
			}
		}
	}

	// Verringert Item um 1 oder Anzahl in Konsole
	async subtractitem(orderItem: OrderItem) {
		if (orderItem.type === OrderItemType.Menu) {
			if (this.tmpAllItemHandler === this.bookedItems) {
				if (this.tmpAnzahl > 0) {
					for (let i = 0; i < orderItem.orderItems.length; i++) {
						let existingOrderItem = orderItem.orderItems[i]

						if (existingOrderItem.orderItemVariations) {
							for (
								let j = 0;
								j <
								(existingOrderItem.orderItemVariations?.length || 0);
								j++
							) {
								existingOrderItem.orderItemVariations[j].count -=
									(existingOrderItem.count / orderItem.count) *
									this.tmpAnzahl
							}
						}

						existingOrderItem.count -=
							(existingOrderItem.count / orderItem.count) *
							this.tmpAnzahl
					}
					orderItem.count -= this.tmpAnzahl
				} else {
					for (let i = 0; i < orderItem.orderItems.length; i++) {
						let existingOrderItem = orderItem.orderItems[i]

						if (existingOrderItem.orderItemVariations) {
							for (
								let j = 0;
								j <
								(existingOrderItem.orderItemVariations?.length || 0);
								j++
							) {
								existingOrderItem.orderItemVariations[j].count -=
									existingOrderItem.count / orderItem.count
							}
						}

						existingOrderItem.count -=
							existingOrderItem.count / orderItem.count
					}
					orderItem.count -= 1
				}

				this.tmpAnzahl = undefined
				this.bookedItems.removeEmptyItems()
				this.showTotal()
			} else {
				if (this.tmpAnzahl > 0) {
					if (orderItem.count >= this.tmpAnzahl) {
						for (let i = 0; i < orderItem.orderItems.length; i++) {
							let existingOrderItem = orderItem.orderItems[i]

							if (existingOrderItem.orderItemVariations) {
								for (
									let j = 0;
									j <
									(existingOrderItem.orderItemVariations?.length || 0);
									j++
								) {
									existingOrderItem.orderItemVariations[j].count -=
										(existingOrderItem.count / orderItem.count) *
										this.tmpAnzahl
								}
							}

							existingOrderItem.count -=
								(existingOrderItem.count / orderItem.count) *
								this.tmpAnzahl
						}
						orderItem.count -= this.tmpAnzahl
					} else {
						window.alert("Anzahl ist zu hoch")
					}
				} else {
					for (let i = 0; i < orderItem.orderItems.length; i++) {
						let existingOrderItem = orderItem.orderItems[i]

						if (existingOrderItem.orderItemVariations) {
							for (
								let j = 0;
								j <
								(existingOrderItem.orderItemVariations?.length || 0);
								j++
							) {
								existingOrderItem.orderItemVariations[j].count -=
									existingOrderItem.count / orderItem.count
							}
						}

						existingOrderItem.count -=
							existingOrderItem.count / orderItem.count
					}
					orderItem.count--
				}

				this.tmpAnzahl = undefined
				this.stagedItems.removeEmptyItems()
				this.showTotal()
			}
		} else if (orderItem.type === OrderItemType.Special) {
			if (
				this.selectedOrderItem.orderItems &&
				this.selectedOrderItem.orderItems.length > 0 &&
				this.selectedOrderItem.orderItems[0].orderItemVariations &&
				this.selectedOrderItem.orderItems[0].orderItemVariations.length > 0
			) {
				this.subtractProductVariationsDialog.show()
			} else {
				if (this.tmpAnzahl > 0) {
					if (this.selectedOrderItem.count >= this.tmpAnzahl) {
						this.selectedOrderItem.count -= this.tmpAnzahl
						this.selectedOrderItem.orderItems[0].count -= this.tmpAnzahl
					} else {
						window.alert("Anzahl ist zu hoch")
					}
				} else {
					this.selectedOrderItem.count -= 1
					this.selectedOrderItem.orderItems[0].count -= 1
				}
				if (this.tmpAllItemHandler === this.bookedItems) {
					this.sendOrderItem(this.selectedOrderItem)
					this.bookedItems.removeEmptyItems()
				} else {
					this.stagedItems.removeEmptyItems()
				}
			}
		} else {
			// Bestehende OrderItem Logik
			if (this.tmpAllItemHandler === this.bookedItems) {
				if (this.selectedOrderItem.orderItemVariations.length <= 0) {
					if (this.tmpAnzahl > 0) {
						if (this.selectedOrderItem.count >= this.tmpAnzahl) {
							this.selectedOrderItem.count -= this.tmpAnzahl
						} else {
							window.alert("Anzahl ist zu hoch")
						}
					} else {
						this.selectedOrderItem.count -= 1
					}

					this.sendOrderItem(this.selectedOrderItem)
					this.bookedItems.removeEmptyItems()

					this.showTotal()
				} else {
					// Wenn Variationen vorhanden sind - öffne den Subtract Dialog
					this.subtractProductVariationsDialog.show()
				}
			} else {
				if (this.selectedOrderItem.orderItemVariations.length > 0) {
					//Wenn Item Variationen enthält - öffne den Subtract Dialog
					this.subtractProductVariationsDialog.show()
				} else if (this.tmpAnzahl > 0) {
					//Wenn zu löschende Anzahl eingegeben wurde (4 X -)
					if (this.selectedOrderItem.count >= this.tmpAnzahl) {
						this.selectedOrderItem.count -= this.tmpAnzahl
					} else {
						window.alert("Anzahl ist zu hoch")
					}

					this.stagedItems.removeEmptyItems()
					this.showTotal()
				} else {
					this.selectedOrderItem.count -= 1
					this.stagedItems.removeEmptyItems()
					this.showTotal()
				}
			}
		}
	}

	selectProductVariationsDialogPrimaryButtonClick(event: {
		variationTree: { [key: string]: number }[]
	}) {
		this.selectProductVariationsDialog.hide()

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

			const variationItems: VariationItem[] = []

			for (const variationItemUuid of key.split(",")) {
				const item = allVariationItems.find(
					vi => vi.uuid === variationItemUuid
				)
				if (item) variationItems.push(item)
			}

			newItem.orderItemVariations.push({
				uuid: crypto.randomUUID(),
				count: value,
				variationItems
			})
		}

		if (this.selectedOrderItem?.type === OrderItemType.Special) {
			let incoming = JSON.parse(JSON.stringify(this.selectedOrderItem))

			newItem.count = 0

			for (let variation of newItem.orderItemVariations) {
				newItem.count += variation.count
			}

			incoming.orderItems = [newItem]
			incoming.count = newItem.count
			this.stagedItems.pushNewItem(incoming)
		} else {
			newItem.count = newItem.orderItemVariations.length
			this.stagedItems.pushNewItem(newItem)
		}
	}

	subtractProductVariationsDialogPrimaryButtonClick(event: {
		variationCombinations: { [key: string]: number }
	}) {
		this.subtractProductVariationsDialog.hide()

		const variationCombinations = event.variationCombinations

		// Determine which item contains the variations
		let targetItem: OrderItem
		if (this.selectedOrderItem.type === OrderItemType.Special) {
			targetItem = this.selectedOrderItem.orderItems[0]
		} else {
			targetItem = this.selectedOrderItem
		}

		// Update the orderItemVariations based on the variationCombinations
		for (let i = targetItem.orderItemVariations.length - 1; i >= 0; i--) {
			const orderItemVariation = targetItem.orderItemVariations[i]
			const key = orderItemVariation.variationItems
				.map(vi => vi.uuid)
				.join(",")

			if (variationCombinations[key] !== undefined) {
				const newCount = variationCombinations[key]

				// Update count
				orderItemVariation.count = newCount

				// Remove if count is 0
				if (orderItemVariation.count === 0) {
					targetItem.orderItemVariations.splice(i, 1)
				}
			}
		}

		// Recalculate counts
		if (this.selectedOrderItem.type === OrderItemType.Special) {
			targetItem.count = 0
			for (const variation of targetItem.orderItemVariations) {
				targetItem.count += variation.count
			}

			this.selectedOrderItem.count = targetItem.count
		} else {
			this.selectedOrderItem.count = 0
			for (const variation of this.selectedOrderItem.orderItemVariations) {
				this.selectedOrderItem.count += variation.count
			}
		}

		if (this.tmpAllItemHandler === this.bookedItems) {
			this.sendOrderItem(this.selectedOrderItem)
			this.bookedItems.removeEmptyItems()
		} else {
			this.stagedItems.removeEmptyItems()
		}

		this.showTotal()
		this.tmpAnzahl = undefined
	}

	async loadTable() {
		if (this.uuid == null) return

		for (let room of this.dataService.restaurant.rooms) {
			for (let table of room.tables) {
				if (table.uuid === this.uuid) {
					this.room = room
					this.table = table
					break
				}
			}
		}
	}

	//Aktualisiere Bestellungen aus DB
	async loadOrders() {
		this.ordersLoading = true

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
								type
								discount
								notes
								takeAway
								course
								order {
									uuid
								}
								product {
									id
									uuid
									type
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
								offer {
									id
									uuid
									offerType
									discountType
									offerValue
									startDate
									endDate
									startTime
									endTime
									weekdays
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
												uuid
												name
												additionalCost
											}
										}
									}
								}
								orderItems {
									items {
										uuid
										count
										type
										discount
										notes
										takeAway
										course
										product {
											id
											uuid
											name
											type
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
						}
					}
				}
			`,
			{
				uuid: this.table.uuid,
				paid: false
			}
		)

		this.ordersLoading = false

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
		this.console = formatPrice(
			this.bookedItems.calculateTotal() + this.stagedItems.calculateTotal()
		)

		this.consoleActive = false
		this.commaUsed = false
		this.tmpAnzahl = 0
		this.xUsed = false
		this.selectedOrderItem = null
	}

	// Fügt Items der Liste an bestellten Artikeln hinzu
	async sendOrder() {
		this.sendOrderLoading = true
		this.bottomSheet.nativeElement.snap("bottom")
		let tmpProductArray: AddProductsInput[] = []

		for (const item of this.stagedItems.getAllPickedItems().values()) {
			tmpProductArray.push({
				uuid: item.product.uuid,
				count: item.count,
				discount: item.discount,
				variations: item.orderItemVariations?.map(variation => ({
					count: variation.count,
					variationItemUuids: variation.variationItems.map(vi => vi.uuid)
				})),
				orderItems: item.orderItems?.map(orderItem => ({
					productUuid: orderItem.product.uuid,
					count: orderItem.count
				}))
			})
		}

		let items = await this.apiService.addProductsToOrder(
			`
				orderItems {
					total
					items {
						uuid
						count
						type
						discount
						notes
						takeAway
						course
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
						orderItems {
							items {
								uuid
								count
								type
								discount
								notes
								takeAway
								course
								product {
									id
									uuid
									name
									type
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
				}
			`,
			{
				uuid: this.orderUuid,
				products: tmpProductArray
			}
		)

		this.bookedItems.clearItems()

		for (const item of items.data.addProductsToOrder.orderItems.items) {
			this.bookedItems.pushNewItem(convertOrderItemResourceToOrderItem(item))
		}

		this.stagedItems.clearItems()

		this.showTotal()
		this.sendOrderLoading = false
		await showToast(this.locale.sendOrderToastText)
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
		if (this.selectedOrderItem === pickedItem) {
			// Deselect the clicked item
			this.selectedOrderItem = null
			this.tmpAllItemHandler = null
		} else {
			// Select the clicked item
			this.selectedOrderItem = pickedItem
			this.tmpAllItemHandler = AllItemHandler
		}
	}

	//Füge selektiertes Item hinzu
	addSelectedItem(orderItem: OrderItem) {
		if (
			orderItem.type === OrderItemType.Menu ||
			orderItem.type === OrderItemType.Special
		) {
			if (
				orderItem.type === OrderItemType.Special &&
				orderItem.orderItems[0].product.variations.length > 0
			) {
				this.selectedProduct = orderItem.orderItems[0].product
				this.selectProductVariationsDialog.show()
			} else {
				// Bestimme Ziel-Handler (wenn ausgewählt: tmpAllItemHandler, sonst stagedItems)
				const handler =
					this.tmpAllItemHandler === this.bookedItems
						? this.bookedItems
						: this.stagedItems

				const delta = this.tmpAnzahl > 0 ? this.tmpAnzahl : 1

				// Erstelle eine Kopie des OrderItems mit der zu addierenden Anzahl
				const incoming: OrderItem = JSON.parse(JSON.stringify(orderItem))

				// Ursprunglicher Parent-Count (falls 0: Fehler vermeiden)
				const originalParentCount =
					orderItem.count && orderItem.count > 0 ? orderItem.count : 1
				incoming.count = delta

				// Skaliere Subitems und deren Variationen pro Einheit (per-unit), dann mit delta multiplizieren
				for (const sub of incoming.orderItems ?? []) {
					const perUnitSubCount = (sub.count ?? 0) / originalParentCount
					sub.count = Math.round(perUnitSubCount * delta)

					if (sub.orderItemVariations?.length) {
						for (const v of sub.orderItemVariations) {
							const perUnitVarCount =
								(v.count ?? 0) / originalParentCount
							v.count = Math.round(perUnitVarCount * delta)
						}
					}
				}

				// Delegiere an den AllItemHandler / Merger
				handler.pushNewItem(incoming)

				this.tmpAnzahl = undefined
				this.showTotal()
			}
		} else {
			this.clickItem(orderItem.product, orderItem.notes)
		}
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

		this.billsOverviewDialog.show()
	}

	async navigateToTransferPage() {
		let selectedTableNumber = Number(this.console)
		if (isNaN(selectedTableNumber)) return

		// Find the table
		let table = this.room.tables.find(t => t.name == selectedTableNumber)
		if (table == null) return

		await this.hideBottomSheet()

		// Navigate to the transfer page with the table UUID
		this.router.navigate(["dashboard", "tables", this.table.uuid, table.uuid])
	}

	selectMenuSpecialProductsDialogPrimaryButtonClick(event: {
		orderItems: OrderItem[]
	}) {
		if (this.selectedProduct.type === "MENU") {
			let total = 0

			// Durch alle ausgewählten Produkte gehen
			for (const orderItem of event.orderItems) {
				total += calculateTotalPriceOfOrderItem(orderItem)
			}

			const offer = this.selectedProduct.offer
			let discount = 0

			if (offer.offerType === "FIXED_PRICE") {
				discount = total - offer.offerValue
			} else if (
				offer.offerType === "DISCOUNT" &&
				offer.discountType === "PERCENTAGE"
			) {
				discount = total * (offer.offerValue / 100)
			} else if (
				offer.offerType === "DISCOUNT" &&
				offer.discountType === "AMOUNT"
			) {
				discount = offer.offerValue
			}

			this.stagedItems.pushNewItem({
				uuid: crypto.randomUUID(),
				type: OrderItemType.Menu,
				count: 1,
				order: null,
				product: this.selectedProduct,
				orderItems: event.orderItems,
				orderItemVariations: [],
				discount
			})
		} else {
			let rabattFaktor = 0

			if (
				this.selectedProduct &&
				this.selectedProduct.offer.discountType === "PERCENTAGE"
			) {
				rabattFaktor = this.selectedProduct.offer.offerValue / 100
			}

			for (const orderItem of event.orderItems) {
				const processedItem: OrderItem = JSON.parse(
					JSON.stringify(orderItem)
				)

				this.stagedItems.pushNewItem({
					uuid: crypto.randomUUID(),
					type: OrderItemType.Special,
					count: 1,
					order: null,
					product: {
						id: this.selectedProduct.id,
						uuid: this.selectedProduct.uuid,
						type: this.selectedProduct.type,
						name: this.selectedProduct.name,
						price: processedItem.product.price,
						category: this.selectedProduct.category,
						variations: [],
						offer: this.selectedProduct.offer
					},
					orderItems: [processedItem],
					orderItemVariations: [],
					discount: processedItem.product.price * rabattFaktor
				})
			}
		}

		this.selectMenuSpecialProductsDialog.hide()
	}

	addNoteButtonClick() {
		if (this.selectedOrderItem != null) {
			if (this.stagedItems.includes(this.selectedOrderItem)) {
				this.tmpAllItemHandler = this.stagedItems
			} else if (this.bookedItems.includes(this.selectedOrderItem)) {
				this.tmpAllItemHandler = this.bookedItems
			}
		}

		this.addNoteDialog.show()
	}

	addNoteDialogPrimaryButtonClick(event: { note: string }) {
		if (this.selectedOrderItem != null) {
			this.selectedOrderItem.notes = event.note

			// Prüfe ob Items mit gleicher Notiz zusammengefasst werden können
			if (this.tmpAllItemHandler != null) {
				this.tmpAllItemHandler.consolidateItems(this.selectedOrderItem)
			}
		}
	}

	orderItemNoteIconClick(event: { orderItem: OrderItem }) {
		this.selectedOrderItem = event.orderItem
		this.viewNoteDialog.orderItem = event.orderItem

		if (this.stagedItems.includes(event.orderItem)) {
			this.tmpAllItemHandler = this.stagedItems
			this.viewNoteDialog.showEditButton = true
			this.viewNoteDialog.show()
		} else {
			this.tmpAllItemHandler = this.bookedItems
			this.viewNoteDialog.showEditButton = false
			this.viewNoteDialog.show()
		}
	}

	takeAwayButtonClick() {
		if (this.selectedOrderItem != null) {
			this.selectedOrderItem.takeAway = !this.selectedOrderItem.takeAway
		}
	}

	setCourseButtonClick() {
		if (this.selectedOrderItem != null && this.consoleActive) {
			const courseNumber = parseInt(this.console)
			if (courseNumber >= 1 && courseNumber <= 9) {
				this.selectedOrderItem.course = courseNumber
				this.showTotal()
			}
		}
	}
}
