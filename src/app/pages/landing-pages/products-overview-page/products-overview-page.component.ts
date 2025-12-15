import { Component, OnInit, ViewChild } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { Category } from "src/app/models/Category"
import { Product } from "src/app/models/Product"
import { Variation } from "src/app/models/Variation"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { AddProductDialogComponent } from "src/app/dialogs/add-product-dialog/add-product-dialog.component"
import { EditProductDialogComponent } from "src/app/dialogs/edit-product-dialog/edit-product-dialog.component"
import { ProductType } from "src/app/types"

@Component({
	selector: "app-products-overview-page",
	standalone: false,
	templateUrl: "./products-overview-page.component.html",
	styleUrl: "./products-overview-page.component.scss"
})
export class ProductsOverviewPageComponent implements OnInit {
	locale = this.localizationService.locale.productPage
	errorsLocale = this.localizationService.locale.errors
	uuid: string = null
	activeTab = "food"
	category: Category = null
	availableVariations: Variation[] = []

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

	constructor(
		private readonly dataService: DataService,
		private readonly localizationService: LocalizationService,
		private readonly router: Router,
		private readonly activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		this.uuid = this.activatedRoute.snapshot.paramMap.get("uuid")
		await this.dataService.davUserPromiseHolder.AwaitResult()

		// Lade Sample-Variationen
		this.availableVariations = this.buildSampleVariations()

		// Lade Sample-Kategorie mit Produkten
		this.category = this.buildSampleCategory()

		// Initialer Tab aus URL oder default
		const currentChild =
			this.activatedRoute.firstChild?.snapshot.routeConfig?.path
		if (currentChild) {
			this.activeTab = currentChild
		} else {
			this.selectTab("food")
		}
	}

	private buildSampleVariations(): Variation[] {
		return [
			{
				uuid: "var-1",
				name: "Größe (Food)",
				variationItems: [
					{ id: 1, uuid: "item-1-1", name: "Klein", additionalCost: 0 },
					{ id: 2, uuid: "item-1-2", name: "Mittel", additionalCost: 150 },
					{ id: 3, uuid: "item-1-3", name: "Groß", additionalCost: 300 }
				]
			},
			{
				uuid: "var-2",
				name: "Extras",
				variationItems: [
					{
						id: 4,
						uuid: "item-2-1",
						name: "Extra Käse",
						additionalCost: 150
					},
					{ id: 5, uuid: "item-2-2", name: "Bacon", additionalCost: 200 },
					{
						id: 6,
						uuid: "item-2-3",
						name: "Champignons",
						additionalCost: 100
					}
				]
			},
			{
				uuid: "var-3",
				name: "Sauce",
				variationItems: [
					{ id: 7, uuid: "item-3-1", name: "Ketchup", additionalCost: 0 },
					{ id: 8, uuid: "item-3-2", name: "Mayo", additionalCost: 0 },
					{ id: 9, uuid: "item-3-3", name: "BBQ", additionalCost: 50 }
				]
			},
			{
				uuid: "var-4",
				name: "Größe (Drinks)",
				variationItems: [
					{ id: 10, uuid: "item-4-1", name: "0.2L", additionalCost: 0 },
					{ id: 11, uuid: "item-4-2", name: "0.4L", additionalCost: 150 },
					{ id: 12, uuid: "item-4-3", name: "0.5L", additionalCost: 200 },
					{ id: 13, uuid: "item-4-4", name: "1L", additionalCost: 350 }
				]
			},
			{
				uuid: "var-5",
				name: "Eis",
				variationItems: [
					{
						id: 14,
						uuid: "item-5-1",
						name: "Ohne Eis",
						additionalCost: 0
					},
					{ id: 15, uuid: "item-5-2", name: "Normal", additionalCost: 0 },
					{
						id: 16,
						uuid: "item-5-3",
						name: "Extra Eis",
						additionalCost: 30
					}
				]
			},
			{
				uuid: "var-6",
				name: "Temperatur",
				variationItems: [
					{ id: 17, uuid: "item-6-1", name: "Kalt", additionalCost: 0 },
					{ id: 18, uuid: "item-6-2", name: "Warm", additionalCost: 0 }
				]
			}
		]
	}

	private buildSampleCategory(): Category {
		const category: Category = {
			uuid: "1",
			name: "Getränke & Speisen",
			products: []
		}

		const sizeVariation: Variation = {
			uuid: "size-var",
			name: "Größe",
			variationItems: [
				{ id: 1, uuid: "size-s", name: "Klein", additionalCost: 0 },
				{ id: 2, uuid: "size-m", name: "Mittel", additionalCost: 150 },
				{ id: 3, uuid: "size-l", name: "Groß", additionalCost: 300 }
			]
		}

		const drinkSizeVariation: Variation = {
			uuid: "drink-size-var",
			name: "Größe",
			variationItems: [
				{ id: 10, uuid: "drink-size-s", name: "0.2L", additionalCost: 0 },
				{ id: 11, uuid: "drink-size-m", name: "0.4L", additionalCost: 150 },
				{ id: 12, uuid: "drink-size-l", name: "0.5L", additionalCost: 200 }
			]
		}

		const iceVariation: Variation = {
			uuid: "ice-var",
			name: "Eis",
			variationItems: [
				{ id: 13, uuid: "ice-none", name: "Ohne Eis", additionalCost: 0 },
				{ id: 14, uuid: "ice-normal", name: "Normal", additionalCost: 0 },
				{ id: 15, uuid: "ice-extra", name: "Extra Eis", additionalCost: 30 }
			]
		}

		category.products = [
			// Food Products
			{
				id: 1001,
				uuid: "prod-1",
				name: "Pizza Margherita",
				price: 850,
				type: "FOOD",
				category,
				variations: [sizeVariation],
				takeaway: true
			},
			{
				id: 1002,
				uuid: "prod-2",
				name: "Pizza Salami",
				price: 950,
				type: "FOOD",
				category,
				variations: [sizeVariation],
				takeaway: true
			},
			{
				id: 1003,
				uuid: "prod-3",
				name: "Pizza Funghi",
				price: 920,
				type: "FOOD",
				category,
				variations: [sizeVariation],
				takeaway: false
			},
			// Drink Products
			{
				id: 2001,
				uuid: "drink-1",
				name: "Coca Cola",
				price: 350,
				type: "DRINK",
				category,
				variations: [drinkSizeVariation, iceVariation],
				takeaway: true
			},
			{
				id: 2002,
				uuid: "drink-2",
				name: "Fanta",
				price: 350,
				type: "DRINK",
				category,
				variations: [drinkSizeVariation, iceVariation],
				takeaway: true
			},
			{
				id: 2003,
				uuid: "drink-3",
				name: "Mineralwasser",
				price: 280,
				type: "DRINK",
				category,
				variations: [drinkSizeVariation],
				takeaway: true
			},
			{
				id: 2004,
				uuid: "drink-4",
				name: "Bier vom Fass",
				price: 420,
				type: "DRINK",
				category,
				variations: [drinkSizeVariation],
				takeaway: false
			},
			// Special Products
			{
				id: 3001,
				uuid: "special-1",
				name: "Tagesgericht",
				price: 1290,
				type: "SPECIAL",
				category,
				variations: [],
				takeaway: true
			},
			// Menu Products
			{
				id: 4001,
				uuid: "menu-1",
				name: "Lunch Menü",
				price: 1490,
				type: "MENU",
				category,
				variations: [],
				takeaway: true
			}
		]

		return category
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
			this.uuid,
			"menu",
			"category"
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

	showAddProductDialog() {
		if (this.addProductDialog) {
			this.addProductDialog.show()
		}
	}

	addProductDialogPrimaryButtonClick(product: Product) {
		this.addProductDialogLoading = true
		// TODO: API call
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
		// TODO: API call
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
		// Lösche das Produkt oder öffne Bestätigungsdialog
		console.log("Delete product:", product)
		// z.B.: this.selectedCategoryObj.products = this.selectedCategoryObj.products.filter(p => p.uuid !== product.uuid)
	}
}
