import { Component, OnInit } from "@angular/core"
import { Category } from "src/app/models/Category"
import { Menu } from "src/app/models/Menu"
import { Product } from "src/app/models/Product"
import { OrderItem } from "src/app/models/OrderItem"
import { ProductType, OrderItemType } from "src/app/types"
import { formatPrice } from "src/app/utils"
import { faPlus, faMinus, faTrash } from "@fortawesome/pro-regular-svg-icons"

@Component({
	templateUrl: "./landing-order-page.component.html",
	styleUrl: "./landing-order-page.component.scss",
	standalone: false
})
export class LandingOrderPageComponent implements OnInit {
	faPlus = faPlus
	faMinus = faMinus
	faTrash = faTrash
	formatPrice = formatPrice

	menu: Menu
	selectedCategory: Category | null = null
	cartItems: OrderItem[] = []

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
							variations: [],
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
							type: "PRODUCT" as ProductType,
							name: "Diavola",
							price: 1050,
							shortcut: 25,
							variations: [],
							takeaway: false
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
							variations: [],
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
		// Scrolle zur Kategorie
		const element = document.getElementById(`category-${category.uuid}`)
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "start" })
		}
	}

	addToCart(product: Product) {
		// Prüfe ob Produkt bereits im Warenkorb ist
		const existingItem = this.cartItems.find(
			item => item.product.uuid === product.uuid
		)

		if (existingItem) {
			existingItem.count++
		} else {
			const newItem: OrderItem = {
				uuid: crypto.randomUUID(),
				type: OrderItemType.Product,
				count: 1,
				order: null,
				product: product,
				orderItems: [],
				orderItemVariations: []
			}
			this.cartItems.push(newItem)
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

	getCartTotal(): number {
		return this.cartItems.reduce(
			(total, item) => total + item.product.price * item.count,
			0
		)
	}

	submitOrder() {
		// Hier würde die Logik zum Absenden der Bestellung implementiert werden
	}
}
