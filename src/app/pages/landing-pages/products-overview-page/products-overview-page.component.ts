import {
	Component,
	OnInit,
	ViewChild,
	HostListener,
	ElementRef
} from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { ContextMenu } from "dav-ui-components"
import { faPen, faTrash, faEllipsis } from "@fortawesome/free-solid-svg-icons"
import { Category } from "src/app/models/Category"
import { Product } from "src/app/models/Product"
import { Variation } from "src/app/models/Variation"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { AddProductDialogComponent } from "src/app/dialogs/add-product-dialog/add-product-dialog.component"
import { EditProductDialogComponent } from "src/app/dialogs/edit-product-dialog/edit-product-dialog.component"
import { AddOfferDialogComponent } from "src/app/dialogs/add-offer-dialog/add-offer-dialog.component"
import { EditOfferDialogComponent } from "src/app/dialogs/edit-offer-dialog/edit-offer-dialog.component"
import { ProductType } from "src/app/types"

@Component({
	selector: "app-products-overview-page",
	standalone: false,
	templateUrl: "./products-overview-page.component.html",
	styleUrl: "./products-overview-page.component.scss"
})
export class ProductsOverviewPageComponent implements OnInit {
	locale = this.localizationService.locale.productPage
	actionsLocale = this.localizationService.locale.actions
	errorsLocale = this.localizationService.locale.errors
	faPen = faPen
	faTrash = faTrash
	faEllipsis = faEllipsis

	uuid: string = null
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

		// Lade verfügbare Produkte für Menü-Dialog
		this.loadAvailableProducts()

		// Lade Menüs
		this.loadMenus()

		// Lade Specials
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
			name: "Pizza",
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

	handleAddButtonClick() {
		if (this.activeTab === "menus") {
			this.showAddOfferDialog()
		} else if (this.activeTab === "specials") {
			this.showAddSpecialDialog()
		} else {
			this.showAddProductDialog()
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

	// Menü-Methoden
	loadAvailableProducts() {
		// Beispiel-Kategorien
		const categoryVorspeisen: Category = {
			uuid: "cat-1",
			name: "Vorspeisen",
			products: []
		}

		const categoryHauptgerichte: Category = {
			uuid: "cat-2",
			name: "Hauptgerichte",
			products: []
		}

		const categoryDesserts: Category = {
			uuid: "cat-3",
			name: "Desserts",
			products: []
		}

		const categoryGetraenke: Category = {
			uuid: "cat-4",
			name: "Getränke",
			products: []
		}

		const categoryBeilagen: Category = {
			uuid: "cat-5",
			name: "Beilagen",
			products: []
		}

		this.availableProducts = [
			{
				id: 1,
				uuid: "prod-1",
				type: "FOOD",
				name: "Tagessuppe",
				price: 5.5,
				category: categoryVorspeisen,
				variations: [
					{
						uuid: "var-soup-1",
						name: "Größe",
						variationItems: [
							{
								id: 1,
								uuid: "var-item-soup-1",
								name: "Klein",
								additionalCost: 0
							},
							{
								id: 2,
								uuid: "var-item-soup-2",
								name: "Groß",
								additionalCost: 2.0
							}
						]
					}
				]
			},
			{
				id: 2,
				uuid: "prod-2",
				type: "FOOD",
				name: "Gemischter Salat",
				price: 6.9,
				category: categoryVorspeisen,
				variations: [
					{
						uuid: "var-salad-1",
						name: "Dressing",
						variationItems: [
							{
								id: 3,
								uuid: "var-item-salad-1",
								name: "Essig & Öl",
								additionalCost: 0
							},
							{
								id: 4,
								uuid: "var-item-salad-2",
								name: "Joghurt",
								additionalCost: 0
							},
							{
								id: 5,
								uuid: "var-item-salad-3",
								name: "Honig-Senf",
								additionalCost: 0.5
							}
						]
					}
				]
			},
			{
				id: 8,
				uuid: "prod-8",
				type: "FOOD",
				name: "Bruschetta",
				price: 5.9,
				category: categoryVorspeisen,
				variations: []
			},
			{
				id: 3,
				uuid: "prod-3",
				type: "FOOD",
				name: "Schnitzel mit Pommes",
				price: 12.9,
				category: categoryHauptgerichte,
				variations: [
					{
						uuid: "var-schnitzel-1",
						name: "Art",
						variationItems: [
							{
								id: 6,
								uuid: "var-item-schnitzel-1",
								name: "Wiener Art",
								additionalCost: 0
							},
							{
								id: 7,
								uuid: "var-item-schnitzel-2",
								name: "Jägerschnitzel",
								additionalCost: 1.5
							},
							{
								id: 8,
								uuid: "var-item-schnitzel-3",
								name: "Zigeunerschnitzel",
								additionalCost: 1.5
							}
						]
					},
					{
						uuid: "var-schnitzel-2",
						name: "Beilage",
						variationItems: [
							{
								id: 9,
								uuid: "var-item-schnitzel-4",
								name: "Pommes",
								additionalCost: 0
							},
							{
								id: 10,
								uuid: "var-item-schnitzel-5",
								name: "Reis",
								additionalCost: 0
							},
							{
								id: 11,
								uuid: "var-item-schnitzel-6",
								name: "Salat",
								additionalCost: 1.0
							}
						]
					}
				]
			},
			{
				id: 4,
				uuid: "prod-4",
				type: "FOOD",
				name: "Spaghetti Carbonara",
				price: 11.5,
				category: categoryHauptgerichte,
				variations: []
			},
			{
				id: 5,
				uuid: "prod-5",
				type: "FOOD",
				name: "Gegrillter Lachs",
				price: 14.9,
				category: categoryHauptgerichte,
				variations: [
					{
						uuid: "var-lachs-1",
						name: "Garstufe",
						variationItems: [
							{
								id: 12,
								uuid: "var-item-lachs-1",
								name: "Medium",
								additionalCost: 0
							},
							{
								id: 13,
								uuid: "var-item-lachs-2",
								name: "Durch",
								additionalCost: 0
							}
						]
					}
				]
			},
			{
				id: 9,
				uuid: "prod-9",
				type: "FOOD",
				name: "Rinderfilet",
				price: 18.9,
				category: categoryHauptgerichte,
				variations: []
			},
			{
				id: 6,
				uuid: "prod-6",
				type: "FOOD",
				name: "Tiramisu",
				price: 4.5,
				category: categoryDesserts,
				variations: []
			},
			{
				id: 7,
				uuid: "prod-7",
				type: "FOOD",
				name: "Panna Cotta",
				price: 4.5,
				category: categoryDesserts,
				variations: []
			},
			{
				id: 12,
				uuid: "prod-12",
				type: "FOOD",
				name: "Apfelstrudel",
				price: 5.2,
				category: categoryDesserts,
				variations: []
			},
			{
				id: 10,
				uuid: "prod-10",
				type: "DRINK",
				name: "Cola 0,4l",
				price: 3.5,
				category: categoryGetraenke,
				variations: [
					{
						uuid: "var-cola-1",
						name: "Typ",
						variationItems: [
							{
								id: 14,
								uuid: "var-item-cola-1",
								name: "Normal",
								additionalCost: 0
							},
							{
								id: 15,
								uuid: "var-item-cola-2",
								name: "Zero",
								additionalCost: 0
							},
							{
								id: 16,
								uuid: "var-item-cola-3",
								name: "Light",
								additionalCost: 0
							}
						]
					}
				]
			},
			{
				id: 11,
				uuid: "prod-11",
				type: "DRINK",
				name: "Wasser 0,5l",
				price: 2.5,
				category: categoryGetraenke,
				variations: []
			},
			{
				id: 13,
				uuid: "prod-13",
				type: "DRINK",
				name: "Orangensaft 0,3l",
				price: 3.2,
				category: categoryGetraenke,
				variations: []
			},
			{
				id: 14,
				uuid: "prod-14",
				type: "FOOD",
				name: "Pommes Frites",
				price: 3.5,
				category: categoryBeilagen,
				variations: [
					{
						uuid: "var-pommes-1",
						name: "Dip",
						variationItems: [
							{
								id: 17,
								uuid: "var-item-pommes-1",
								name: "Ketchup",
								additionalCost: 0
							},
							{
								id: 18,
								uuid: "var-item-pommes-2",
								name: "Mayo",
								additionalCost: 0
							},
							{
								id: 19,
								uuid: "var-item-pommes-3",
								name: "Aioli",
								additionalCost: 0.5
							}
						]
					}
				]
			},
			{
				id: 15,
				uuid: "prod-15",
				type: "FOOD",
				name: "Reis",
				price: 2.9,
				category: categoryBeilagen,
				variations: []
			},
			{
				id: 16,
				uuid: "prod-16",
				type: "FOOD",
				name: "Gemüse der Saison",
				price: 4.2,
				category: categoryBeilagen,
				variations: []
			}
		]
	}

	loadMenus() {
		// Beispieldaten für Menüs
		this.menus = [
			{
				id: 100,
				uuid: "menu-1",
				type: "MENU",
				name: "Mittagsmenü",
				price: 24.9,
				takeaway: true,
				variations: [],
				offer: {
					id: 1,
					uuid: "offer-1",
					offerType: "FIXED_PRICE",
					offerValue: 24.9,
					weekdays: [
						"MONDAY",
						"TUESDAY",
						"WEDNESDAY",
						"THURSDAY",
						"FRIDAY"
					],
					offerItems: [
						{
							uuid: "item-1",
							name: "Vorspeise",
							maxSelections: 1,
							products: [
								{
									id: 1,
									uuid: "prod-1",
									type: "FOOD",
									name: "Tagessuppe",
									price: 5.5,
									variations: [
										{
											uuid: "var-soup-1",
											name: "Größe",
											variationItems: [
												{
													id: 1,
													uuid: "var-item-soup-1",
													name: "Klein",
													additionalCost: 0
												},
												{
													id: 2,
													uuid: "var-item-soup-2",
													name: "Groß",
													additionalCost: 2.0
												}
											]
										}
									]
								},
								{
									id: 2,
									uuid: "prod-2",
									type: "FOOD",
									name: "Gemischter Salat",
									price: 6.9,
									variations: [
										{
											uuid: "var-salad-1",
											name: "Dressing",
											variationItems: [
												{
													id: 3,
													uuid: "var-item-salad-1",
													name: "Essig & Öl",
													additionalCost: 0
												},
												{
													id: 4,
													uuid: "var-item-salad-2",
													name: "Joghurt",
													additionalCost: 0
												},
												{
													id: 5,
													uuid: "var-item-salad-3",
													name: "Honig-Senf",
													additionalCost: 0.5
												}
											]
										}
									]
								}
							]
						},
						{
							uuid: "item-2",
							name: "Hauptgang",
							maxSelections: 1,
							products: [
								{
									id: 3,
									uuid: "prod-3",
									type: "FOOD",
									name: "Schnitzel mit Pommes",
									price: 12.9,
									variations: [
										{
											uuid: "var-schnitzel-1",
											name: "Art",
											variationItems: [
												{
													id: 6,
													uuid: "var-item-schnitzel-1",
													name: "Wiener Art",
													additionalCost: 0
												},
												{
													id: 7,
													uuid: "var-item-schnitzel-2",
													name: "Jägerschnitzel",
													additionalCost: 1.5
												},
												{
													id: 8,
													uuid: "var-item-schnitzel-3",
													name: "Zigeunerschnitzel",
													additionalCost: 1.5
												}
											]
										},
										{
											uuid: "var-schnitzel-2",
											name: "Beilage",
											variationItems: [
												{
													id: 9,
													uuid: "var-item-schnitzel-4",
													name: "Pommes",
													additionalCost: 0
												},
												{
													id: 10,
													uuid: "var-item-schnitzel-5",
													name: "Reis",
													additionalCost: 0
												},
												{
													id: 11,
													uuid: "var-item-schnitzel-6",
													name: "Salat",
													additionalCost: 1.0
												}
											]
										}
									]
								},
								{
									id: 4,
									uuid: "prod-4",
									type: "FOOD",
									name: "Spaghetti Carbonara",
									price: 11.5,
									variations: []
								},
								{
									id: 5,
									uuid: "prod-5",
									type: "FOOD",
									name: "Gegrillter Lachs",
									price: 14.9,
									variations: [
										{
											uuid: "var-lachs-1",
											name: "Garstufe",
											variationItems: [
												{
													id: 12,
													uuid: "var-item-lachs-1",
													name: "Medium",
													additionalCost: 0
												},
												{
													id: 13,
													uuid: "var-item-lachs-2",
													name: "Durch",
													additionalCost: 0
												}
											]
										}
									]
								}
							]
						},
						{
							uuid: "item-3",
							name: "Dessert",
							maxSelections: 1,
							products: [
								{
									id: 6,
									uuid: "prod-6",
									type: "FOOD",
									name: "Tiramisu",
									price: 4.5,
									variations: []
								},
								{
									id: 7,
									uuid: "prod-7",
									type: "FOOD",
									name: "Panna Cotta",
									price: 4.5,
									variations: []
								}
							]
						}
					]
				}
			},
			{
				id: 101,
				uuid: "menu-2",
				type: "MENU",
				name: "Wochenend-Special",
				price: 15.9,
				variations: [],
				offer: {
					id: 2,
					uuid: "offer-2",
					offerType: "FIXED_PRICE",
					offerValue: 15.9,
					weekdays: ["SATURDAY", "SUNDAY"],
					offerItems: [
						{
							uuid: "item-4",
							name: "Hauptgang",
							maxSelections: 1,
							products: [
								{
									id: 8,
									uuid: "prod-8",
									type: "FOOD",
									name: "Pizza Margherita",
									price: 8.9,
									variations: []
								},
								{
									id: 9,
									uuid: "prod-9",
									type: "FOOD",
									name: "Burger mit Pommes",
									price: 10.9,
									variations: []
								}
							]
						},
						{
							uuid: "item-5",
							name: "Getränk",
							maxSelections: 1,
							products: [
								{
									id: 10,
									uuid: "prod-10",
									type: "DRINK",
									name: "Cola 0,4l",
									price: 3.5,
									variations: [
										{
											uuid: "var-cola-1",
											name: "Typ",
											variationItems: [
												{
													id: 14,
													uuid: "var-item-cola-1",
													name: "Normal",
													additionalCost: 0
												},
												{
													id: 15,
													uuid: "var-item-cola-2",
													name: "Zero",
													additionalCost: 0
												},
												{
													id: 16,
													uuid: "var-item-cola-3",
													name: "Light",
													additionalCost: 0
												}
											]
										}
									]
								},
								{
									id: 11,
									uuid: "prod-11",
									type: "DRINK",
									name: "Wasser 0,5l",
									price: 2.5,
									variations: []
								}
							]
						}
					]
				}
			}
		]
	}

	loadSpecials() {
		// Beispieldaten für Specials
		this.specials = [
			{
				id: 200,
				uuid: "special-1",
				type: "SPECIAL",
				name: "Happy Hour",
				price: 9.9,
				takeaway: false,
				variations: [],
				offer: {
					id: 2,
					uuid: "offer-2",
					offerType: "FIXED_PRICE",
					offerValue: 9.9,
					weekdays: [
						"MONDAY",
						"TUESDAY",
						"WEDNESDAY",
						"THURSDAY",
						"FRIDAY"
					],
					startTime: "17:00",
					endTime: "19:00",
					offerItems: [
						{
							uuid: "special-item-1",
							name: "Produkte",
							maxSelections: 1,
							products: [
								{
									id: 10,
									uuid: "prod-10",
									type: "DRINK",
									name: "Cola 0,4l",
									price: 3.5,
									variations: [
										{
											uuid: "var-cola-special-1",
											name: "Typ",
											variationItems: [
												{
													id: 14,
													uuid: "var-item-cola-special-1",
													name: "Normal",
													additionalCost: 0
												},
												{
													id: 15,
													uuid: "var-item-cola-special-2",
													name: "Zero",
													additionalCost: 0
												},
												{
													id: 16,
													uuid: "var-item-cola-special-3",
													name: "Light",
													additionalCost: 0
												}
											]
										}
									]
								},
								{
									id: 11,
									uuid: "prod-11",
									type: "DRINK",
									name: "Wasser 0,5l",
									price: 2.5,
									variations: []
								},
								{
									id: 12,
									uuid: "prod-12",
									type: "FOOD",
									name: "Pommes Frites",
									price: 4.5,
									variations: [
										{
											uuid: "var-pommes-1",
											name: "Dip",
											variationItems: [
												{
													id: 17,
													uuid: "var-item-pommes-1",
													name: "Ketchup",
													additionalCost: 0
												},
												{
													id: 18,
													uuid: "var-item-pommes-2",
													name: "Mayo",
													additionalCost: 0
												},
												{
													id: 19,
													uuid: "var-item-pommes-3",
													name: "Aioli",
													additionalCost: 0.5
												}
											]
										}
									]
								}
							]
						}
					]
				}
			}
		]
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
		if (this.addOfferDialog.isSpecialMode) {
			// Special-Modus
			if (this.editingSpecial) {
				// Bestehendes Special aktualisieren
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
				// Neues Special erstellen
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
				// Bestehendes Menü aktualisieren
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
				// Neues Menü erstellen
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
		this.addOfferDialog.hide()
		// TODO: Save to API
	}

	showEditOfferDialog(menu: Product) {
		this.editingMenu = menu
		this.editOfferDialog.isSpecialMode = false
		this.editOfferDialog.show(menu)
	}

	showEditSpecialDialog(special: Product) {
		this.editingSpecial = special
		this.editOfferDialog.isSpecialMode = true
		this.editOfferDialog.show(special)
	}

	editOfferDialogPrimaryButtonClick(data: {
		id: number
		name: string
		price: number
		takeaway: boolean
		offer: any
	}) {
		if (this.editingSpecial) {
			// Special aktualisieren
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
			// Menü aktualisieren
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
		this.editOfferDialog.hide()
		// TODO: Save to API
	}

	deleteOffer(menu: Product) {
		const confirmed = confirm(`Menü "${menu.name}" wirklich löschen?`)
		if (!confirmed) return
		this.menus = this.menus.filter(m => m.uuid !== menu.uuid)
		// TODO: Delete from API
	}

	deleteSpecial(special: Product) {
		const confirmed = confirm(`Special "${special.name}" wirklich löschen?`)
		if (!confirmed) return
		this.specials = this.specials.filter(s => s.uuid !== special.uuid)
		// TODO: Delete from API
	}
}
