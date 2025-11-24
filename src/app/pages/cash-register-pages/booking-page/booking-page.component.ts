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
import { TmpVariations } from "src/app/models/cash-register/tmp-variations.model"
import { Table } from "src/app/models/Table"
import { Room } from "src/app/models/Room"
import { VariationItem } from "src/app/models/VariationItem"
import { Order } from "src/app/models/Order"
import { OfferItem } from "src/app/models/OfferItem"
import {
	AddProductsInput,
	AddProductVariationInput,
	OrderItemType
} from "src/app/types"
import { OrderItemVariation } from "src/app/models/OrderItemVariation"
import { SelectTableDialogComponent } from "src/app/dialogs/select-table-dialog/select-table-dialog.component"
import { SelectProductDialogComponent } from "src/app/dialogs/select-product-dialog/select-product-dialog.component"
import { SelectProductVariationsDialogComponent } from "src/app/dialogs/select-product-variations-dialog/select-product-variations-dialog.component"
import { AddNoteDialogComponent } from "src/app/dialogs/add-note-dialog/add-note-dialog.component"
import { ViewNoteDialogComponent } from "src/app/dialogs/view-note-dialog/view-note-dialog.component"
import { digitKeyRegex, numpadKeyRegex } from "src/app/constants"
import {
	calculateTotalPriceOfOrderItem,
	convertCategoryResourceToCategory,
	convertOrderItemResourceToOrderItem,
	convertOrderResourceToOrder,
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
	OrderItemType = OrderItemType
	categories: Category[] = []
	selectedInventory: Product[] = []
	selectedCategory: string = ""
	productsLoading: boolean = true
	ordersLoading: boolean = true

	isMenuePopupVisible: boolean = false
	specialCategories: Category[] = []
	specialProducts: Product[] = []
	currentSpecial: Product | null = null
	currentMenu: Product | null = null
	tmpCurrentMenu: Product | null = null
	currentMaxSelections: number = 0
	currentIndex: number = 0
	tmpSpecialSelectedItems: OrderItem[] = []
	tmpSpecialAllItemsHandler = new AllItemHandler()

	bookedItems = new AllItemHandler()
	stagedItems = new AllItemHandler()

	endpreis: number = 0.0

	lastClickedItem: Product = null

	lastClickedItemSource: "new" | "booked" | null = null

	console: string = "0,00 €"

	selectedItemNew: Product = null

	isItemPopupVisible: boolean = false
	isSpecialVariationPopupVisible: boolean = false
	isSpecialVariationMode: boolean = false

	consoleActive: boolean = false

	commaUsed: boolean = false
	uuid: string = null
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

	@ViewChild("ordersContainer")
	ordersContainer: ElementRef<HTMLDivElement>

	//#region SelectTableDialog variables
	@ViewChild("selectTableDialog")
	selectTableDialog: SelectTableDialogComponent
	//#endregion

	//#region SelectProductDialog variables
	@ViewChild("selectProductDialog")
	selectProductDialog: SelectProductDialogComponent
	//#endregion

	//#region SelectProductVariationsDialog variables
	@ViewChild("selectProductVariationsDialog")
	selectProductVariationsDialog: SelectProductVariationsDialogComponent
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

	// Zeige Variations-Popup an
	toggleItemPopup() {
		// this.isItemPopupVisible = !this.isItemPopupVisible
		this.selectProductVariationsDialog.show()
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
		this.tmpAllItemHandler = null

		if (this.minusUsed) {
			this.minusUsed = false
		}
	}

	// Füge item zu stagedItems hinzu
	clickItem(product: Product, note?: string) {
		if (product == null) return
		this.selectedItem = null
		this.currentSpecial = null
		this.currentMenu = null

		if (product.type === "SPECIAL") {
			this.currentSpecial = JSON.parse(JSON.stringify(product))
			this.isMenuePopupVisible = true
			this.specialCategories = []
			for (let offerItem of product.offer.offerItems) {
				for (let product of offerItem.products) {
					if (
						!this.specialCategories.some(
							cat => cat.uuid === product.category.uuid
						)
					) {
						this.specialCategories.push(product.category)
					}
				}
			}

			this.changeSelectedSpecialInventory(this.specialCategories[0])
		} else if (product.type === "MENU") {
			this.currentMenu = JSON.parse(JSON.stringify(product))
			this.tmpCurrentMenu = JSON.parse(JSON.stringify(product))
			this.isMenuePopupVisible = true
			this.changeSelectedMenuInventory(
				this.currentMenu.offer.offerItems[0],
				this.currentMenu.offer.offerItems[0].maxSelections,
				0
			)

			for (let item of this.currentMenu.offer.offerItems) {
				for (let product of item.products) {
					if (
						!this.specialCategories.some(
							cat => cat.uuid === product.category.uuid
						)
					) {
						this.specialCategories.push(product.category)
					}
				}
			}
		} else {
			let newItem: OrderItem = {
				uuid: crypto.randomUUID(),
				type: OrderItemType.Product,
				count: 0,
				order: null,
				product,
				orderItemVariations: [],
				note: note
			}

			if (product.variations.length === 0) {
				newItem.count = this.tmpAnzahl > 0 ? this.tmpAnzahl : 1

				this.stagedItems.pushNewItem(newItem)
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

				// this.isItemPopupVisible = true
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
					orderItem.count--
				}

				this.tmpAnzahl = undefined
				this.stagedItems.removeEmptyItems()
				this.showTotal()
			}
		} else if (orderItem.type === OrderItemType.Special) {
			this.tmpSelectedItem = JSON.parse(
				JSON.stringify(this.selectedItem.orderItems[0])
			)
			this.minusUsed = true
			this.isItemPopupVisible = true
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
					this.bookedItems.removeEmptyItems()

					this.showTotal()
				} else {
					// Wenn Variationen vorhanden sind
					this.tmpSelectedItem = JSON.parse(
						JSON.stringify(this.selectedItem)
					)
					this.minusUsed = true
					this.isItemPopupVisible = true
				}
			} else {
				if (this.selectedItem.orderItemVariations.length > 0) {
					//Wenn Item Variationen enthält
					this.tmpSelectedItem = JSON.parse(
						JSON.stringify(this.selectedItem)
					)
					this.minusUsed = true
					this.isItemPopupVisible = true
				} else if (this.tmpAnzahl > 0) {
					//Wenn zu löschende Anzahl eingegeben wurde (4 X -)
					if (this.selectedItem.count >= this.tmpAnzahl) {
						this.selectedItem.count -= this.tmpAnzahl
					} else {
						window.alert("Anzahl ist zu hoch")
					}

					this.stagedItems.removeEmptyItems()
					this.showTotal()
				} else {
					this.selectedItem.count -= 1
					this.stagedItems.removeEmptyItems()
					this.showTotal()
				}
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

		if (orderItem != null) {
			orderItem.count = this.tmpSelectedItem.count
			orderItem.orderItemVariations =
				this.tmpSelectedItem.orderItemVariations

			if (this.tmpAllItemHandler === this.bookedItems) {
				this.sendOrderItem(orderItem)
			}
		}

		// Cleanup (wie in sendVariation)
		this.tmpPickedVariationResource = []
		this.tmpCountVariations = 0
		this.tmpSelectedItem = undefined
		this.showTotal()

		// Je nach Modus den richtigen ItemHandler verwenden
		if (this.isSpecialVariationMode) {
			this.tmpSpecialAllItemsHandler.removeEmptyItems()
		} else {
			this.tmpAllItemHandler.removeEmptyItems()
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

	selectProductVariationsDialogPrimaryButtonClick(event: {
		variationTree: { [key: string]: number }[]
	}) {
		this.selectProductVariationsDialog.hide()

		const lastVariationTree = event.variationTree.pop()
		const allVariationItems = this.lastClickedItem.variations
			.map(v => v.variationItems)
			.flat()

		const newItem: OrderItem = {
			uuid: crypto.randomUUID(),
			type: OrderItemType.Product,
			count: 1,
			order: null,
			product: this.lastClickedItem,
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
		if (this.selectedItem?.type === OrderItemType.Special) {
			let incoming = JSON.parse(JSON.stringify(this.selectedItem))

			newItem.count = 0
			for (let variation of newItem.orderItemVariations) {
				newItem.count += variation.count
			}
			incoming.orderItems = [newItem]
			incoming.count = newItem.count
			console.log(incoming)
			this.stagedItems.pushNewItem(incoming)
		} else {
			newItem.count = newItem.orderItemVariations.length
			this.stagedItems.pushNewItem(newItem)
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

				if (this.currentMenu) {
					this.currentMaxSelections =
						this.currentMenu.offer.offerItems[
							this.currentIndex
						].maxSelections

					if (this.currentMaxSelections === 0) {
						let nextIndex = this.findNextAvailableCategory()
						if (nextIndex !== -1) {
							this.currentIndex = nextIndex
							this.changeSelectedMenuInventory(
								this.currentMenu.offer.offerItems[this.currentIndex],
								this.currentMenu.offer.offerItems[this.currentIndex]
									.maxSelections,
								this.currentIndex
							)
						}
					}
				}

				this.isSpecialVariationPopupVisible = false
				this.isSpecialVariationMode = false
			} else {
				// Normaler Modus: Erstelle neues OrderItem
				let orderItem: OrderItem = {
					uuid: this.lastClickedItem.uuid,
					type: OrderItemType.Product,
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

				if (this.isSpecialVariationMode) {
					// Index- und maxSelections-Logik für Produkte mit Variationen
					let firstIndex = this.currentIndex
					if (this.currentMenu) {
						this.currentMenu.offer.offerItems[
							this.currentIndex
						].maxSelections -= 1
						this.currentMaxSelections =
							this.currentMenu.offer.offerItems[
								this.currentIndex
							].maxSelections

						// Wenn maxSelections = 0, dann nächsten Index suchen
						if (this.currentMaxSelections === 0) {
							let nextIndex = this.findNextAvailableCategory()
							// Wenn gültiger Index gefunden wurde
							if (nextIndex !== -1) {
								this.currentIndex = nextIndex
								this.changeSelectedMenuInventory(
									this.currentMenu.offer.offerItems[this.currentIndex],
									this.currentMenu.offer.offerItems[this.currentIndex]
										.maxSelections,
									this.currentIndex
								)
							}
						}
					}

					// Füge das OrderItem zum tmpSpecialAllItemsHandler hinzu
					this.tmpSpecialAllItemsHandler.pushNewItem(orderItem, firstIndex)
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
			this.showTotal()
		}
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
		this.console =
			(this.bookedItems.calculateTotal() + this.stagedItems.calculateTotal())
				.toFixed(2)
				.replace(".", ",") + " €"

		this.consoleActive = false
		this.commaUsed = false
		this.tmpAnzahl = 0
		this.xUsed = false
		this.selectedItem = null
	}

	// Fügt Items der Liste an bestellten Artikeln hinzu
	async sendOrder() {
		this.bottomSheet.nativeElement.snap("bottom")
		let tmpProductArray: AddProductsInput[] = []

		for (let values of this.stagedItems.getAllPickedItems().values()) {
			let product: AddProductsInput = {
				uuid: values.uuid,
				count: values.count,
				variations: []
			}

			for (let orderItemVariation of values.orderItemVariations) {
				let variation: AddProductVariationInput = {
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
		if (this.selectedItem === pickedItem) {
			// Deselect the clicked item
			this.selectedItem = null
			this.tmpAllItemHandler = null
		} else {
			// Select the clicked item
			this.selectedItem = pickedItem
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
				this.lastClickedItem = orderItem.orderItems[0].product

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
			this.clickItem(orderItem.product, orderItem.note)
		}
	}

	// async createBill(payment: PaymentMethod) {
	// 	// Create a bill if it doesn't exist
	// 	if (this.billUuid == null) {
	// 		// TODO: Get the current register client
	// 		const createBillResponse = await this.apiService.createBill(`uuid`, {
	// 			registerClientUuid: "eb76aee4-0054-4e56-89b1-0cbefde357a9"
	// 		})

	// 		if (createBillResponse.data == null) {
	// 			return
	// 		}

	// 		this.billUuid = createBillResponse.data.createBill.uuid
	// 	}

	// 	const completeOrderResponse = await this.apiService.completeOrder(
	// 		"uuid",
	// 		{
	// 			uuid: this.orderUuid,
	// 			billUuid: this.billUuid,
	// 			paymentMethod: payment
	// 		}
	// 	)

	// 	if (completeOrderResponse.data == null) {
	// 		// TODO: Error handling
	// 		return
	// 	}

	// 	window.location.reload()
	// }

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

		if (this.bills.length > 0) {
			this.pickedBill = this.bills[0]
			this.isBillPopupVisible = true
		}
	}

	closeBills() {
		this.isBillPopupVisible = false
		this.bills = []
		this.pickedBill = null
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

	checkForPlus(variation: OrderItemVariation) {
		let variationCount = this.selectedItem.orderItemVariations.find(
			v =>
				v.variationItems.length === variation.variationItems.length &&
				v.variationItems.every(
					(item, index) =>
						item.name === variation.variationItems[index].name
				)
		)?.count

		if (variationCount <= variation.count) {
			return true
		}
		return false
	}

	checkForPlusaddVariation(variation: TmpVariations) {
		if (this.currentSpecial) {
			return false
		}

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

		if (
			this.tmpCurrentMenu &&
			this.tmpCurrentMenu.offer.offerItems &&
			this.tmpCurrentMenu.offer.offerItems[this.currentIndex]
		) {
			return (
				totalCount >=
				this.tmpCurrentMenu.offer.offerItems[this.currentIndex]
					.maxSelections
			)
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

	changeSelectedSpecialInventory(category: Category) {
		// Filtere alle Produkte der ausgewählten Kategorie aus allen OfferItems
		this.specialProducts = []
		if (this.currentSpecial) {
			for (let offerItem of this.currentSpecial.offer.offerItems) {
				for (let product of offerItem.products) {
					if (product.category.uuid === category.uuid) {
						this.specialProducts.push(product)
					}
				}
			}
		}
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
			i < this.currentMenu.offer.offerItems.length;
			i++
		) {
			if (this.currentMenu.offer.offerItems[i].maxSelections > 0) {
				return i
			}
		}

		// Falls keine gefunden, suche von Anfang bis zur aktuellen Position
		for (let i = 0; i < this.currentIndex; i++) {
			if (this.currentMenu.offer.offerItems[i].maxSelections > 0) {
				return i
			}
		}

		// Keine verfügbare Kategorie gefunden
		return -1
	}

	closeOffer() {
		// Stelle die ursprünglichen maxSelections wieder her, falls ein Menü aktiv war
		if (this.currentMenu) {
			// Gehe durch alle Items im temporären Handler und stelle maxSelections wieder her
			for (let item of this.tmpSpecialAllItemsHandler.getAllPickedItems()) {
				// Finde die entsprechende Kategorie für dieses Produkt
				for (let menuItem of this.currentMenu.offer.offerItems) {
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
		this.currentSpecial = null
		this.currentMenu = null // Menü-Variable zurücksetzen
		this.currentIndex = 0 // Index zurücksetzen
		this.currentMaxSelections = 0 // MaxSelections zurücksetzen
		this.tmpSpecialAllItemsHandler = new AllItemHandler()
	}

	clickSpecialProduct(product: Product) {
		if (product == null) return

		let newItem: OrderItem = {
			uuid: crypto.randomUUID(),
			type: OrderItemType.Product,
			count: 0,
			order: null,
			product,
			orderItemVariations: []
		}

		if (product.variations.length === 0) {
			let firstIndex = this.currentIndex

			if (this.currentMenu) {
				this.currentMenu.offer.offerItems[
					this.currentIndex
				].maxSelections -= 1
				this.currentMaxSelections =
					this.currentMenu.offer.offerItems[
						this.currentIndex
					].maxSelections

				if (this.currentMaxSelections === 0) {
					let nextIndex = this.findNextAvailableCategory()
					if (nextIndex !== -1) {
						this.currentIndex = nextIndex
						this.changeSelectedMenuInventory(
							this.currentMenu.offer.offerItems[this.currentIndex],
							this.currentMenu.offer.offerItems[this.currentIndex]
								.maxSelections,
							this.currentIndex
						)
					}
				}
			}

			// Vereinfachung: delegiere das Insert/Merge an tmpSpecialAllItemsHandler
			newItem.count = 1
			this.tmpSpecialAllItemsHandler.pushNewItem(newItem, firstIndex)
		} else {
			console.log("Special-Variation-Popup öffnen")
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
		if (item.count === 0 || item.orderItemVariations.length > 0) {
			this.tmpSpecialAllItemsHandler.deleteItem(item)
		}

		// Finde die entsprechende Kategorie basierend auf dem Produkt
		let targetCategoryIndex = -1
		for (let i = 0; i < this.currentMenu.offer.offerItems.length; i++) {
			const menuItem = this.currentMenu.offer.offerItems[i]

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
			this.currentMenu.offer.offerItems[targetCategoryIndex].maxSelections +=
				1

			// Springe zur entsprechenden Kategorie
			this.currentIndex = targetCategoryIndex
			this.changeSelectedMenuInventory(
				this.currentMenu.offer.offerItems[targetCategoryIndex],
				this.currentMenu.offer.offerItems[targetCategoryIndex]
					.maxSelections,
				targetCategoryIndex
			)
		}
	}

	editSpecial(item: OrderItem) {
		this.selectedItem = item
		this.tmpSelectedItem = JSON.parse(JSON.stringify(item))
		this.minusUsed = false
		this.lastClickedItem = item.product

		this.tmpPickedVariationResource = []
		this.tmpCountVariations = 0

		if (item.product.variations && item.product.variations.length > 0) {
			for (let variationItem of item.product.variations[
				this.tmpCountVariations
			].variationItems) {
				let currentCount = 0

				for (let orderItemVariation of item.orderItemVariations) {
					for (let existingVariationItem of orderItemVariation.variationItems) {
						if (existingVariationItem.uuid === variationItem.uuid) {
							currentCount = orderItemVariation.count
							break
						}
					}
					if (currentCount > 0) break
				}

				this.tmpPickedVariationResource.push(
					new Map<number, TmpVariations[]>().set(0, [
						{
							uuid: variationItem.uuid,
							count: currentCount,
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

		let targetCategoryIndex = -1

		if (this.currentMenu) {
			for (let i = 0; i < this.currentMenu.offer.offerItems.length; i++) {
				const menuItem = this.currentMenu.offer.offerItems[i]

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

			if (targetCategoryIndex >= 0) {
				this.currentIndex = targetCategoryIndex
				this.changeSelectedMenuInventory(
					this.currentMenu.offer.offerItems[targetCategoryIndex],
					this.currentMenu.offer.offerItems[targetCategoryIndex]
						.maxSelections,
					targetCategoryIndex
				)
			}
		} else if (this.currentSpecial) {
			let productCategory = item.product.category
			if (productCategory) {
				this.changeSelectedSpecialInventory(productCategory)
			}
		}

		this.isSpecialVariationPopupVisible = true
		this.isSpecialVariationMode = true
		this.tmpAllItemHandler = this.tmpSpecialAllItemsHandler
	}

	confirmSpecials() {
		let rabattFaktor = 0

		if (
			this.currentSpecial &&
			this.currentSpecial.offer.discountType === "PERCENTAGE"
		) {
			rabattFaktor = this.currentSpecial.offer.offerValue / 100
		}

		// Durch alle ausgewählten Produkte gehen und für jedes ein separates Special OrderItem erstellen
		for (let item of this.tmpSpecialAllItemsHandler.getAllPickedItems()) {
			let processedItem: OrderItem = JSON.parse(JSON.stringify(item))
			let originalProductPrice = processedItem.product.price

			let orderItem: OrderItem = {
				uuid: crypto.randomUUID(),
				type: OrderItemType.Special,
				count: processedItem.count,
				order: null,
				product: {
					id: this.currentSpecial.id,
					uuid: processedItem.product.uuid,
					type: processedItem.product.type,
					name: processedItem.product.name,
					price: originalProductPrice,
					category: processedItem.product.category,
					variations: [],
					offer: this.currentSpecial.offer
				},
				orderItems: [processedItem],
				orderItemVariations: [],
				discount: -(originalProductPrice * rabattFaktor)
			}

			// vorher: manuelles sameOrderItemExists + inkrementieren
			// ersatz: delegieren an den Handler / Merger
			this.stagedItems.pushNewItem(orderItem)
		}

		// Cleanup
		this.isMenuePopupVisible = false
		this.specialCategories = []
		this.specialProducts = []
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

		if (this.currentMenu && this.currentMenu.offer.offerType) {
			switch (this.currentMenu.offer.offerType) {
				case "FIXED_PRICE":
					finalMenuPrice = this.currentMenu.offer.offerValue
					totalRabattBetrag = finalMenuPrice - originalTotalPrice
					break
				case "DISCOUNT":
					if (this.currentMenu.offer.discountType === "PERCENTAGE") {
						finalMenuPrice =
							originalTotalPrice *
							(1 - this.currentMenu.offer.offerValue / 100)
						totalRabattBetrag = finalMenuPrice - originalTotalPrice
					} else if (this.currentMenu.offer.discountType === "AMOUNT") {
						finalMenuPrice =
							originalTotalPrice - this.currentMenu.offer.offerValue
						totalRabattBetrag = -this.currentMenu.offer.offerValue
					}
					break
				default:
					finalMenuPrice = originalTotalPrice
					break
			}
		}

		let orderItem: OrderItem = {
			uuid: crypto.randomUUID(),
			type: OrderItemType.Menu,
			count: 1,
			order: null,
			product: {
				id: this.currentMenu.id,
				uuid: crypto.randomUUID(),
				type: "FOOD",
				name: this.currentMenu.name,
				price: finalMenuPrice,
				category: null,
				variations: [],
				offer: this.currentMenu.offer
			},
			orderItems: allOrderItems,
			discount: totalRabattBetrag
		}

		// Delegiere das Mergen / Einfügen an den Handler / Merger
		this.stagedItems.pushNewItem(orderItem)

		// Cleanup
		this.isMenuePopupVisible = false
		this.specialCategories = []
		this.specialProducts = []
		this.currentMenu = null
		this.tmpCurrentMenu = null
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

		if (currentMenuOrSpecial && currentMenuOrSpecial.offer.offerType) {
			switch (currentMenuOrSpecial.offer.offerType) {
				case "FIXED_PRICE":
					itemPrice = currentMenuOrSpecial.offer.offerValue
					break
				case "DISCOUNT":
					if (currentMenuOrSpecial.offer.discountType === "PERCENTAGE") {
						itemPrice =
							originalPrice *
							(1 - currentMenuOrSpecial.offer.offerValue / 100)
					} else if (
						currentMenuOrSpecial.offer.discountType === "AMOUNT"
					) {
						itemPrice =
							originalPrice - currentMenuOrSpecial.offer.offerValue
					}
					break
				default:
					itemPrice = originalPrice
					break
			}
		}

		return itemPrice
	}

	addNoteButtonClick() {
		if (this.selectedItem != null) {
			if (this.stagedItems.includes(this.selectedItem)) {
				this.tmpAllItemHandler = this.stagedItems
			} else if (this.bookedItems.includes(this.selectedItem)) {
				this.tmpAllItemHandler = this.bookedItems
			}
		}

		this.addNoteDialog.show()
	}

	addNoteDialogPrimaryButtonClick(event: { note: string }) {
		if (this.selectedItem != null) {
			this.selectedItem.note = event.note

			// Prüfe ob Items mit gleicher Notiz zusammengefasst werden können
			if (this.tmpAllItemHandler != null) {
				this.tmpAllItemHandler.consolidateItems(this.selectedItem)
			}
		}
	}

	orderItemNoteIconClick(event: { orderItem: OrderItem }) {
		this.selectedItem = event.orderItem
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
		if (this.selectedItem != null) {
			this.selectedItem.takeAway = !this.selectedItem.takeAway
		}
	}

	setCourseButtonClick() {
		if (this.selectedItem != null && this.consoleActive) {
			const courseNumber = parseInt(this.console)
			if (courseNumber >= 1 && courseNumber <= 9) {
				this.selectedItem.course = courseNumber
				this.showTotal()
			}
		}
	}
}
