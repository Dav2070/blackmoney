import { Component, ViewChild, HostListener, ElementRef } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import {
	faPen,
	faTrash,
	faEllipsis,
	faUtensils,
	faGlass,
	faBurgerSoda,
	faBadgePercent
} from "@fortawesome/pro-regular-svg-icons"
import { ContextMenu } from "dav-ui-components"
import { Category } from "src/app/models/Category"
import { Product } from "src/app/models/Product"
import { Variation } from "src/app/models/Variation"
import { OfferItem } from "src/app/models/OfferItem"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { ApiService } from "src/app/services/api-service"
import { EditCategoryDialogComponent } from "src/app/dialogs/edit-category-dialog/edit-category-dialog.component"
import { DeleteCategoryDialogComponent } from "src/app/dialogs/delete-category-dialog/delete-category-dialog.component"
import { AddProductDialogComponent } from "src/app/dialogs/add-product-dialog/add-product-dialog.component"
import { EditProductDialogComponent } from "src/app/dialogs/edit-product-dialog/edit-product-dialog.component"
import { AddOfferDialogComponent } from "src/app/dialogs/add-offer-dialog/add-offer-dialog.component"
import { EditOfferDialogComponent } from "src/app/dialogs/edit-offer-dialog/edit-offer-dialog.component"
import * as ErrorCodes from "src/app/errorCodes"
import { ProductType } from "src/app/types"
import {
	convertCategoryResourceToCategory,
	convertRestaurantResourceToRestaurant,
	getGraphQLErrorCodes
} from "src/app/utils"

@Component({
	templateUrl: "./category-page.component.html",
	styleUrl: "./category-page.component.scss",
	standalone: false
})
export class CategoryPageComponent {
	locale = this.localizationService.locale.categoryPage
	actionsLocale = this.localizationService.locale.actions
	errorsLocale = this.localizationService.locale.errors
	faPen = faPen
	faTrash = faTrash
	faEllipsis = faEllipsis
	faUtensils = faUtensils
	faGlass = faGlass
	faBurgerSoda = faBurgerSoda
	faBadgePercent = faBadgePercent

	restaurantUuid: string = null
	categoryUuid: string = null
	productTypeFilter: ProductType | null = null
	loading: boolean = true
	category: Category = null
	availableVariations: Variation[] = []
	availableProducts: Product[] = []

	//#region AddButtonContextMenu
	@ViewChild("addButtonContextMenu")
	addButtonContextMenu: ElementRef<ContextMenu>
	addButtonContextMenuVisible: boolean = false
	addButtonContextMenuPositionX: number = 0
	addButtonContextMenuPositionY: number = 0
	//#endregion

	//#region ProductContextMenu
	@ViewChild("productContextMenu")
	productContextMenu: ElementRef<ContextMenu>
	productContextMenuVisible: boolean = false
	productContextMenuPositionX: number = 0
	productContextMenuPositionY: number = 0
	productContextMenuSelectedProduct: Product | null = null
	//#endregion

	@ViewChild("editCategoryDialog")
	editCategoryDialog!: EditCategoryDialogComponent
	editCategoryDialogLoading: boolean = false
	editCategoryDialogNameError: string = ""

	@ViewChild("deleteCategoryDialog")
	deleteCategoryDialog!: DeleteCategoryDialogComponent
	deleteCategoryDialogLoading: boolean = false

	@ViewChild("addProductDialog")
	addProductDialog: AddProductDialogComponent
	addProductDialogLoading: boolean = false
	addProductDialogProductType: ProductType = "FOOD"
	addProductDialogNameError: string = ""
	addProductDialogPriceError: string = ""

	@ViewChild("editProductDialog")
	editProductDialog: EditProductDialogComponent
	editProductDialogLoading: boolean = false
	editProductDialogNameError: string = ""
	editProductDialogPriceError: string = ""

	@ViewChild("addOfferDialog")
	addOfferDialog!: AddOfferDialogComponent
	addOfferDialogLoading: boolean = false

	@ViewChild("editOfferDialog")
	editOfferDialog!: EditOfferDialogComponent
	editOfferDialogLoading: boolean = false
	editingOffer: Product | null = null

	constructor(
		private readonly dataService: DataService,
		private readonly localizationService: LocalizationService,
		private readonly apiService: ApiService,
		private readonly router: Router,
		private readonly activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		this.restaurantUuid =
			this.activatedRoute.snapshot.paramMap.get("restaurantUuid")
		this.categoryUuid =
			this.activatedRoute.snapshot.paramMap.get("categoryUuid")
		await this.dataService.davUserPromiseHolder.AwaitResult()
		// Load available variations once (uses cache-first)
		await this.loadVariations()
		// Load category with products from backend
		await this.loadData()
	}

	@HostListener("document:click", ["$event"])
	documentClick(event: MouseEvent) {
		if (
			!this.addButtonContextMenu.nativeElement.contains(event.target as Node)
		) {
			this.addButtonContextMenuVisible = false
		}

		if (
			!this.productContextMenu.nativeElement.contains(event.target as Node)
		) {
			this.productContextMenuVisible = false
		}
	}

	navigateBack() {
		this.router.navigate([
			"dashboard",
			"restaurants",
			this.restaurantUuid,
			"menu",
			"categories"
		])
	}

	async filterChange(event: Event) {
		this.productTypeFilter = (event as CustomEvent).detail
			.filter as ProductType
		await this.loadData()
	}

	async loadData() {
		this.loading = true

		// Load category with filtered products
		const retrieveCategoryResponse = await this.apiService.retrieveCategory(
			`
				uuid
				name
				products(type: $type) {
					items {
						uuid
						name
						type
						shortcut
						price
						variations {
							items {
								uuid
								name
								variationItems {
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
								items {
									uuid
									name
									maxSelections
									products {
										items {
											uuid
											name
										}
									}
								}
							}
						}
					}
				}
			`,
			{ uuid: this.categoryUuid, type: this.productTypeFilter }
		)

		if (retrieveCategoryResponse.data != null) {
			this.category = convertCategoryResourceToCategory(
				retrieveCategoryResponse.data.retrieveCategory
			)
		}

		// Load all available products for the offer dialogs (FOOD and DRINK only)
		const allCategoriesResponse = await this.apiService.listCategories(
			`
				items {
					uuid
					products {
						items {
							uuid
							name
							type
							price
							variations {
								items {
									uuid
									name
									variationItems {
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
			{ restaurantUuid: this.restaurantUuid }
		)

		if (
			allCategoriesResponse.data != null &&
			allCategoriesResponse.data.listCategories?.items
		) {
			const categories = allCategoriesResponse.data.listCategories.items
			const allProducts: Product[] = []

			// Alle Produkte aus allen Kategorien sammeln
			for (const categoryResource of categories) {
				const category = convertCategoryResourceToCategory(categoryResource)
				if (category.products) {
					allProducts.push(...category.products)
				}
			}

			// Filter nur FOOD und DRINK Produkte für Offers
			this.availableProducts = allProducts.filter(
				p => p.type === "FOOD" || p.type === "DRINK"
			)
		}

		this.loading = false
	}

	async loadVariations() {
		// Load available variations from menu (uses cache-first by default)
		const retrieveRestaurantResponse =
			await this.apiService.retrieveRestaurant(
				`
					menu {
						variations {
							items {
								uuid
								name
								variationItems {
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
				`,
				{ uuid: this.restaurantUuid }
			)

		if (retrieveRestaurantResponse.data != null) {
			const restaurant = convertRestaurantResourceToRestaurant(
				retrieveRestaurantResponse.data.retrieveRestaurant
			)
			this.availableVariations = restaurant.menu?.variations || []
		}
	}

	handleAddButtonClick(event: Event) {
		if (this.addButtonContextMenuVisible) {
			this.addButtonContextMenuVisible = false
		} else {
			const contextMenuPosition = (event as CustomEvent).detail
				.contextMenuPosition

			this.addButtonContextMenuPositionX = contextMenuPosition.x
			this.addButtonContextMenuPositionY = contextMenuPosition.y
			this.addButtonContextMenuVisible = true
		}
	}

	handleEditButtonClick() {
		this.editCategoryDialog.show()
	}

	async editCategoryDialogPrimaryButtonClick(event: { name: string }) {
		const name = event.name.trim()

		if (name.length === 0) {
			this.editCategoryDialogNameError = this.errorsLocale.nameMissing
			return
		}

		this.editCategoryDialogLoading = true

		const updateCategoryResponse = await this.apiService.updateCategory(
			`
				uuid
				name
			`,
			{
				uuid: this.category.uuid,
				name
			}
		)

		this.editCategoryDialogLoading = false

		if (updateCategoryResponse.data?.updateCategory != null) {
			const responseData = convertCategoryResourceToCategory(
				updateCategoryResponse.data.updateCategory
			)
			this.category.name = responseData.name
			this.editCategoryDialog.hide()
		} else {
			const errors = getGraphQLErrorCodes(updateCategoryResponse)
			if (errors == null) return

			for (const errorCode of errors) {
				switch (errorCode) {
					case ErrorCodes.nameTooShort:
						this.editCategoryDialogNameError =
							this.errorsLocale.nameTooShort
						break
					case ErrorCodes.nameTooLong:
						this.editCategoryDialogNameError =
							this.errorsLocale.nameTooLong
						break
					default:
						this.editCategoryDialogNameError =
							this.errorsLocale.unexpectedError
						break
				}
			}
		}
	}

	handleDeleteButtonClick() {
		this.deleteCategoryDialog.show()
	}

	async deleteCategoryDialogPrimaryButtonClick() {
		this.deleteCategoryDialogLoading = true

		await this.apiService.deleteCategory(`uuid`, { uuid: this.category.uuid })

		this.deleteCategoryDialog.hide()
		this.deleteCategoryDialogLoading = false
		this.navigateBack()
	}

	addFoodContextMenuItemClick() {
		this.addButtonContextMenuVisible = false
		this.addProductDialogProductType = "FOOD"
		this.showAddProductDialog()
	}

	addDrinkContextMenuItemClick() {
		this.addButtonContextMenuVisible = false
		this.addProductDialogProductType = "DRINK"
		this.showAddProductDialog()
	}

	addMenuContextMenuItemClick() {
		this.addButtonContextMenuVisible = false
		this.showAddOfferDialog()
	}

	addSpecialContextMenuItemClick() {
		this.addButtonContextMenuVisible = false
		this.showAddSpecialDialog()
	}

	productCardOptionsButtonClick(event: CustomEvent, product: Product) {
		if (this.productContextMenuVisible) {
			this.productContextMenuVisible = false
		} else {
			this.productContextMenuPositionX = event.detail.contextMenuPosition.x
			this.productContextMenuPositionY = event.detail.contextMenuPosition.y
			this.productContextMenuSelectedProduct = product
			this.productContextMenuVisible = true
		}
	}

	editProductContextMenuItemClick() {
		this.productContextMenuVisible = false

		if (
			["MENU", "SPECIAL"].includes(
				this.productContextMenuSelectedProduct.type
			)
		) {
			this.showEditOfferDialog(this.productContextMenuSelectedProduct)
		} else {
			this.showEditProductDialog(this.productContextMenuSelectedProduct)
		}
	}

	deleteProductContextMenuItemClick() {
		this.productContextMenuVisible = false

		if (this.productContextMenuSelectedProduct) {
			this.deleteProduct(this.productContextMenuSelectedProduct)
		}
	}

	// Product Methods
	showAddProductDialog() {
		if (this.addProductDialog) {
			this.addProductDialog.show()
		}
	}

	async addProductDialogPrimaryButtonClick(product: Product) {
		this.addProductDialogLoading = true
		this.addProductDialogNameError = ""
		this.addProductDialogPriceError = ""

		const createProductResponse = await this.apiService.createProduct(
			`
				uuid
				name
				type
				price
				shortcut
				variations {
					items {
						uuid
						name
						variationItems {
							items {
								id
								uuid
								name
								additionalCost
							}
						}
					}
				}
			`,
			{
				categoryUuid: this.category.uuid,
				name: product.name,
				price: product.price,
				type: this.addProductDialogProductType,
				shortcut: product.shortcut,
				variationUuids: product.variations?.map(v => v.uuid)
			}
		)

		if (createProductResponse.data?.createProduct != null) {
			await this.loadData()
			this.addProductDialog.hide()
			this.addProductDialogLoading = false
		} else {
			this.addProductDialogLoading = false
			const errors = getGraphQLErrorCodes(createProductResponse)
			if (errors == null) return

			for (const errorCode of errors) {
				switch (errorCode) {
					case ErrorCodes.nameTooShort:
						this.addProductDialogNameError =
							this.errorsLocale.nameTooShort
						break
					case ErrorCodes.nameTooLong:
						this.addProductDialogNameError = this.errorsLocale.nameTooLong
						break
					case ErrorCodes.priceInvalid:
						this.addProductDialogPriceError =
							this.errorsLocale.priceInvalid
						break
					default:
						this.addProductDialogNameError =
							this.errorsLocale.unexpectedError
						break
				}
			}
		}
	}

	showEditProductDialog(product: Product) {
		if (this.editProductDialog) {
			this.editProductDialog.show(product)
		}
	}

	async editProductDialogPrimaryButtonClick(product: Product) {
		this.editProductDialogLoading = true
		this.editProductDialogNameError = ""
		this.editProductDialogPriceError = ""

		const updateProductResponse = await this.apiService.updateProduct(
			`
				uuid
				name
				type
				price
				shortcut
				variations {
					items {
						uuid
						name
						variationItems {
							items {
								id
								uuid
								name
								additionalCost
							}
						}
					}
				}
			`,
			{
				uuid: product.uuid,
				name: product.name,
				price: product.price,
				shortcut: product.shortcut,
				variationUuids: product.variations?.map(v => v.uuid)
			}
		)

		if (updateProductResponse.data?.updateProduct != null) {
			await this.loadData()
			this.editProductDialog.hide()
			this.editProductDialogLoading = false
		} else {
			this.editProductDialogLoading = false
			const errors = getGraphQLErrorCodes(updateProductResponse)
			if (errors == null) return

			for (const errorCode of errors) {
				switch (errorCode) {
					case ErrorCodes.nameTooShort:
						this.editProductDialogNameError =
							this.errorsLocale.nameTooShort
						break
					case ErrorCodes.nameTooLong:
						this.editProductDialogNameError =
							this.errorsLocale.nameTooLong
						break
					case ErrorCodes.priceInvalid:
						this.editProductDialogPriceError =
							this.errorsLocale.priceInvalid
						break
					default:
						this.editProductDialogNameError =
							this.errorsLocale.unexpectedError
						break
				}
			}
		}
	}

	async deleteProduct(product: Product) {
		const confirmed = confirm(`Produkt "${product.name}" wirklich löschen?`)
		if (!confirmed) return

		await this.apiService.deleteProduct(`uuid`, { uuid: product.uuid })
		await this.loadData()
	}

	showAddOfferDialog() {
		this.addOfferDialog.isSpecialMode = false
		this.addOfferDialog.show()
	}

	showAddSpecialDialog() {
		this.addOfferDialog.isSpecialMode = true
		this.addOfferDialog.show()
	}

	async addOfferDialogPrimaryButtonClick(data: {
		id: number
		name: string
		price: number
		takeaway: boolean
		offer: any
	}) {
		this.addOfferDialogLoading = true

		try {
			// Bestimme den ProductType basierend auf isSpecialMode
			const productType: ProductType = this.addOfferDialog.isSpecialMode
				? "SPECIAL"
				: "MENU"

			// Der Dialog konvertiert bereits zu Cent, keine weitere Konvertierung nötig
			const priceInCents = data.price
			const offerValueInCents = data.offer.offerValue

			// 1. Erstelle zuerst das Produkt
			const createProductResponse = await this.apiService.createProduct(
				`uuid`,
				{
					categoryUuid: this.category.uuid,
					name: data.name,
					price: priceInCents,
					type: productType,
					shortcut: data.id
				}
			)

			if (createProductResponse.data?.createProduct == null) {
				console.error("Failed to create product")
				this.addOfferDialogLoading = false
				return
			}

			const productUuid = createProductResponse.data.createProduct.uuid

			// 2. Konvertiere offerItems für das Backend
			const offerItems = data.offer.offerItems.map((item: OfferItem) => ({
				name: item.name,
				maxSelections: item.maxSelections,
				productUuids: item.products.map((p: Product) => p.uuid)
			}))

			// 3. Erstelle das Offer
			await this.apiService.createOffer(`uuid`, {
				productUuid: productUuid,
				offerType: data.offer.offerType,
				discountType: data.offer.discountType,
				offerValue: offerValueInCents,
				startDate:
					data.offer.startDate &&
					(typeof data.offer.startDate === "string"
						? data.offer.startDate.trim() !== ""
						: true)
						? new Date(data.offer.startDate).toISOString()
						: undefined,
				endDate:
					data.offer.endDate &&
					(typeof data.offer.endDate === "string"
						? data.offer.endDate.trim() !== ""
						: true)
						? new Date(data.offer.endDate).toISOString()
						: undefined,
				startTime:
					data.offer.startTime &&
					typeof data.offer.startTime === "string" &&
					data.offer.startTime.trim() !== ""
						? data.offer.startTime
						: undefined,
				endTime:
					data.offer.endTime &&
					typeof data.offer.endTime === "string" &&
					data.offer.endTime.trim() !== ""
						? data.offer.endTime
						: undefined,
				weekdays: data.offer.weekdays,
				offerItems: offerItems
			})

			// Lade die Daten neu
			await this.loadData()
			this.addOfferDialog.hide()
		} catch (error) {
			console.error("Error creating offer:", error)
		} finally {
			this.addOfferDialogLoading = false
		}
	}

	showEditOfferDialog(offer: Product) {
		this.editingOffer = offer
		this.editOfferDialog.isSpecialMode = offer.type === "SPECIAL"
		this.editOfferDialog.show(offer)
	}

	async editOfferDialogPrimaryButtonClick(data: {
		id: number
		name: string
		price: number
		takeaway: boolean
		offer: any
	}) {
		this.editOfferDialogLoading = true

		try {
			if (!this.editingOffer) {
				console.error("No product being edited")
				this.editOfferDialogLoading = false
				return
			}

			// Der Dialog konvertiert bereits zu Cent, keine weitere Konvertierung nötig
			const priceInCents = data.price
			const offerValueInCents = data.offer.offerValue

			// 1. Update das Produkt
			await this.apiService.updateProduct(`uuid`, {
				uuid: this.editingOffer.uuid,
				name: data.name,
				price: priceInCents,
				shortcut: data.id
			})

			// 2. Update das Offer, falls vorhanden
			if (this.editingOffer.offer?.uuid) {
				const offerItems = data.offer.offerItems.map((item: OfferItem) => ({
					name: item.name,
					maxSelections: item.maxSelections,
					productUuids: item.products.map((p: Product) => p.uuid)
				}))

				const updatePayload = {
					uuid: this.editingOffer.offer.uuid,
					offerType: data.offer.offerType,
					discountType: data.offer.discountType,
					offerValue: offerValueInCents,
					startDate:
						data.offer.startDate &&
						(typeof data.offer.startDate === "string"
							? data.offer.startDate.trim() !== ""
							: true)
							? new Date(data.offer.startDate).toISOString()
							: null,
					endDate:
						data.offer.endDate &&
						(typeof data.offer.endDate === "string"
							? data.offer.endDate.trim() !== ""
							: true)
							? new Date(data.offer.endDate).toISOString()
							: null,
					startTime:
						data.offer.startTime &&
						typeof data.offer.startTime === "string" &&
						data.offer.startTime.trim() !== ""
							? data.offer.startTime
							: null,
					endTime:
						data.offer.endTime &&
						typeof data.offer.endTime === "string" &&
						data.offer.endTime.trim() !== ""
							? data.offer.endTime
							: null,
					weekdays: data.offer.weekdays,
					offerItems: offerItems
				}

				const response = await this.apiService.updateOffer(
					`uuid`,
					updatePayload
				)
			}

			// Lade die Daten neu
			await this.loadData()
			this.editOfferDialog.hide()
			this.editingOffer = null
		} catch (error) {
			console.error("Error updating offer:", error)
		} finally {
			this.editOfferDialogLoading = false
		}
	}

	async deleteOffer(offer: Product) {
		const offerType = offer.type === "SPECIAL" ? "Special" : "Menü"

		const confirmed = confirm(
			`${offerType} "${offer.name}" wirklich löschen?`
		)
		if (!confirmed) return

		// Lösche das Produkt (das Offer wird durch Cascade gelöscht)
		await this.apiService.deleteProduct(`uuid`, { uuid: offer.uuid })
		await this.loadData()
	}
}
