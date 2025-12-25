import {
	Component,
	ViewChild,
	HostListener,
} from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { faPen, faTrash, faEllipsis } from "@fortawesome/free-solid-svg-icons"
import { Category } from "src/app/models/Category"
import { Product } from "src/app/models/Product"
import { Variation } from "src/app/models/Variation"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { ApiService } from "src/app/services/api-service"
import { AddProductDialogComponent } from "src/app/dialogs/add-product-dialog/add-product-dialog.component"
import { EditProductDialogComponent } from "src/app/dialogs/edit-product-dialog/edit-product-dialog.component"
import { AddOfferDialogComponent } from "src/app/dialogs/add-offer-dialog/add-offer-dialog.component"
import { EditOfferDialogComponent } from "src/app/dialogs/edit-offer-dialog/edit-offer-dialog.component"
import { ProductType } from "src/app/types"

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

	restaurantUuid: string = null
	categoryUuid: string = null
	activeTab = "food"
	category: Category = null
	availableVariations: Variation[] = []
	menus: Product[] = []
	specials: Product[] = []
	availableProducts: Product[] = []

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
		this.restaurantUuid = this.activatedRoute.snapshot.paramMap.get("restaurantUuid")
		this.categoryUuid = this.activatedRoute.snapshot.paramMap.get("categoryUuid")
		await this.dataService.davUserPromiseHolder.AwaitResult()

		// TODO: API - Load variations from backend
		// Example: this.availableVariations = await this.apiService.retrieveVariations(...)
		this.availableVariations = []

		// TODO: API - Load category with products from backend
		// Example: this.category = await this.apiService.retrieveCategory(this.uuid)
		this.category = null

		// TODO: API - Load available products for offer dialogs
		// Example: this.availableProducts = await this.apiService.retrieveProducts(...)
		this.loadAvailableProducts()

		// TODO: API - Load menus from backend
		// Example: this.menus = await this.apiService.retrieveMenus(...)
		this.loadMenus()

		// TODO: API - Load specials from backend
		// Example: this.specials = await this.apiService.retrieveSpecials(...)
		this.loadSpecials()

		// Initialer Tab aus URL oder default
		const currentChild =
			this.activatedRoute.firstChild?.snapshot.routeConfig?.path
		if (currentChild) {
			this.activeTab = currentChild
		} else {
			this.selectTab("food")
		}
	}

	@HostListener("document:click", ["$event"])
	documentClick(event: MouseEvent) {
		// Context menus are now handled in child components
	}

	selectTab(tab: string) {
		this.activeTab = tab
		// navigate to child route (relativeTo this component's route)
		this.router.navigate([tab], { relativeTo: this.activatedRoute })
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

	mapPathToType(path: string): ProductType {
		switch (path) {
			case "drinks":
				return "DRINK"
			case "specials":
				return "SPECIAL"
			case "menus":
				return "MENU"
			default:
				return "FOOD"
		}
	}

	handleAddButtonClick() {
		if (this.activeTab === "menus") {
			this.showAddOfferDialog()
		} else if (this.activeTab === "specials") {
			this.showAddSpecialDialog()
		} else {
			this.showAddProductDialog()
		}
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

	// Offer/Menu Methods
	loadAvailableProducts() {
		// TODO: API - Load available products for offer creation
		// Example: this.availableProducts = await this.apiService.retrieveProducts({ restaurantUuid: this.uuid })
		this.availableProducts = []
	}

	loadMenus() {
		// TODO: API - Load menus from backend
		// Example: this.menus = await this.apiService.retrieveMenus({ restaurantUuid: this.uuid })
		this.menus = []
	}

	loadSpecials() {
		// TODO: API - Load specials from backend
		// Example: this.specials = await this.apiService.retrieveSpecials({ restaurantUuid: this.uuid })
		this.specials = []
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
