import {
	Component,
	ViewChild,
	HostListener,
} from "@angular/core"
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
import { Category } from "src/app/models/Category"
import { Product } from "src/app/models/Product"
import { Variation } from "src/app/models/Variation"
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
	getGraphQLErrorCodes
} from "src/app/utils"

@Component({
	templateUrl: "./category-page.component.html",
	styleUrl: "./category-page.component.scss",
	standalone: false
})
export class CategoryPageComponent {
	locale = this.localizationService.locale.productPage
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
	category: Category = null
	availableVariations: Variation[] = []
	menus: Product[] = []
	specials: Product[] = []
	availableProducts: Product[] = []

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
	editingMenu: Product | null = null
	editingSpecial: Product | null = null

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

		// Load category with products from backend
		const retrieveCategoryResponse = await this.apiService.retrieveCategory(
			`
				uuid
				name
				products(type: $type) {
					items {
						id
						uuid
						name
						type
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
	}

	@HostListener("document:click", ["$event"])
	documentClick(event: MouseEvent) {
		// Context menus are now handled in child components
	}

	navigateBack() {
		this.router.navigate([
			"user",
			"restaurants",
			this.restaurantUuid,
			"menu",
			"categories"
		])
	}

	filterChange(event: Event) {
		this.productTypeFilter = (event as CustomEvent).detail
			.filter as ProductType
	}

	handleAddButtonClick() {
		if (this.productTypeFilter === "MENU") {
			this.showAddOfferDialog()
		} else if (this.productTypeFilter === "SPECIAL") {
			this.showAddSpecialDialog()
		} else {
			this.showAddProductDialog()
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

	// Product Methods
	showAddProductDialog() {
		if (this.addProductDialog) {
			this.addProductDialog.show()
		}
	}

	addProductDialogPrimaryButtonClick(product: Product) {
		this.addProductDialogLoading = true

		// TODO: API - Create product
		// Example: await this.apiService.createProduct({ ...product, categoryUuid: this.category.uuid })

		if (this.category) {
			this.category.products = [...this.category.products, product]
		}

		this.addProductDialogLoading = false
		this.addProductDialog.hide()
	}

	showEditProductDialog(product: Product) {
		if (this.editProductDialog) {
			this.editProductDialog.show(product)
		}
	}

	editProductDialogPrimaryButtonClick(product: Product) {
		this.editProductDialogLoading = true

		// TODO: API - Update product
		// Example: await this.apiService.updateProduct(product.uuid, product)

		if (this.category) {
			const index = this.category.products.findIndex(
				p => p.uuid === product.uuid
			)
			if (index !== -1) {
				this.category.products = [
					...this.category.products.slice(0, index),
					product,
					...this.category.products.slice(index + 1)
				]
			}
		}

		this.editProductDialogLoading = false
		this.editProductDialog.hide()
	}

	deleteProduct(product: Product) {
		const confirmed = confirm(`Produkt "${product.name}" wirklich löschen?`)
		if (!confirmed) return

		// TODO: API - Delete product
		// Example: await this.apiService.deleteProduct(product.uuid)

		if (this.category) {
			this.category.products = this.category.products.filter(
				p => p.uuid !== product.uuid
			)
		}
	}

	showAddOfferDialog() {
		this.addOfferDialog.isSpecialMode = false
		this.addOfferDialog.show()
	}

	showAddSpecialDialog() {
		this.addOfferDialog.isSpecialMode = true
		this.addOfferDialog.show()
	}

	addOfferDialogPrimaryButtonClick(data: {
		id: number
		name: string
		price: number
		takeaway: boolean
		offer: any
	}) {
		this.addOfferDialogLoading = true

		if (this.addOfferDialog.isSpecialMode) {
			// Special-Modus
			if (this.editingSpecial) {
				// TODO: API - Update special
				// Example: await this.apiService.updateSpecial(this.editingSpecial.uuid, data)

				const index = this.specials.findIndex(
					s => s.uuid === this.editingSpecial!.uuid
				)
				if (index !== -1) {
					this.specials[index] = {
						...this.specials[index],
						id: data.id,
						name: data.name,
						price: data.price,
						takeaway: data.takeaway,
						offer: data.offer
					}
				}
				this.editingSpecial = null
			} else {
				// TODO: API - Create new special
				// Example: const newSpecial = await this.apiService.createSpecial({ ...data, restaurantUuid: this.uuid })

				const newSpecial: Product = {
					id: data.id,
					uuid: crypto.randomUUID(),
					type: "SPECIAL",
					name: data.name,
					price: data.price,
					variations: [],
					takeaway: data.takeaway,
					offer: data.offer
				}
				this.specials.push(newSpecial)
			}
		} else {
			// Menü-Modus
			if (this.editingMenu) {
				// TODO: API - Update menu
				// Example: await this.apiService.updateMenu(this.editingMenu.uuid, data)

				const index = this.menus.findIndex(
					m => m.uuid === this.editingMenu!.uuid
				)
				if (index !== -1) {
					this.menus[index] = {
						...this.menus[index],
						id: data.id,
						name: data.name,
						price: data.price,
						takeaway: data.takeaway,
						offer: data.offer
					}
				}
				this.editingMenu = null
			} else {
				// TODO: API - Create new menu
				// Example: const newMenu = await this.apiService.createMenu({ ...data, restaurantUuid: this.uuid })

				const newMenu: Product = {
					id: data.id,
					uuid: crypto.randomUUID(),
					type: "MENU",
					name: data.name,
					price: data.price,
					variations: [],
					takeaway: data.takeaway,
					offer: data.offer
				}
				this.menus.push(newMenu)
			}
		}

		this.addOfferDialogLoading = false
		this.addOfferDialog.hide()
	}

	showEditOfferDialog(offer: Product) {
		// Determine if it's a special or menu based on the source array
		const isSpecial = this.specials.some(s => s.uuid === offer.uuid)

		if (isSpecial) {
			this.editingSpecial = offer
			this.editOfferDialog.isSpecialMode = true
		} else {
			this.editingMenu = offer
			this.editOfferDialog.isSpecialMode = false
		}

		this.editOfferDialog.show(offer)
	}

	editOfferDialogPrimaryButtonClick(data: {
		id: number
		name: string
		price: number
		takeaway: boolean
		offer: any
	}) {
		this.editOfferDialogLoading = true

		if (this.editingSpecial) {
			// TODO: API - Update special
			// Example: await this.apiService.updateSpecial(this.editingSpecial.uuid, data)

			const index = this.specials.findIndex(
				s => s.uuid === this.editingSpecial!.uuid
			)
			if (index !== -1) {
				this.specials[index] = {
					...this.specials[index],
					id: data.id,
					name: data.name,
					price: data.price,
					takeaway: data.takeaway,
					offer: data.offer
				}
			}
			this.editingSpecial = null
		} else if (this.editingMenu) {
			// TODO: API - Update menu
			// Example: await this.apiService.updateMenu(this.editingMenu.uuid, data)

			const index = this.menus.findIndex(
				m => m.uuid === this.editingMenu!.uuid
			)
			if (index !== -1) {
				this.menus[index] = {
					...this.menus[index],
					id: data.id,
					name: data.name,
					price: data.price,
					takeaway: data.takeaway,
					offer: data.offer
				}
			}
			this.editingMenu = null
		}

		this.editOfferDialogLoading = false
		this.editOfferDialog.hide()
	}

	deleteOffer(offer: Product) {
		// Determine if it's a special or menu
		const isSpecial = this.specials.some(s => s.uuid === offer.uuid)
		const offerType = isSpecial ? "Special" : "Menü"

		const confirmed = confirm(
			`${offerType} "${offer.name}" wirklich löschen?`
		)
		if (!confirmed) return

		if (isSpecial) {
			// TODO: API - Delete special
			// Example: await this.apiService.deleteSpecial(offer.uuid)
			this.specials = this.specials.filter(s => s.uuid !== offer.uuid)
		} else {
			// TODO: API - Delete menu
			// Example: await this.apiService.deleteMenu(offer.uuid)
			this.menus = this.menus.filter(m => m.uuid !== offer.uuid)
		}
	}
}
