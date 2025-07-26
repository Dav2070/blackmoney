import { Component } from "@angular/core"
import { Category } from "src/app/models/Category"
import { Variation } from "src/app/models/Variation"
import { Menu } from "src/app/models/Menu"

@Component({
	selector: "app-menue-page",
	templateUrl: "./menue-page.component.html",
	styleUrl: "./menue-page.component.scss",
	standalone: false
})
export class MenuePageComponent {
	allVariations: Variation[] = [
		{
			uuid: "groessen",
			name: "Größen",
			variationItems: [
				{ id: 1, uuid: "klein", name: "Klein", additionalCost: 0 },
				{ id: 2, uuid: "mittel", name: "Mittel", additionalCost: 1 },
				{ id: 3, uuid: "gross", name: "Groß", additionalCost: 2 }
			]
		},
		{
			uuid: "beilagen",
			name: "Beilagen",
			variationItems: [
				{ id: 1, uuid: "pommes", name: "Pommes", additionalCost: 0 },
				{ id: 2, uuid: "reis", name: "Reis", additionalCost: 0.5 },
				{ id: 3, uuid: "kroketten", name: "Kroketten", additionalCost: 1 }
			]
		}
	]

	selectedCategory: Category = {
		uuid: "vorspeisen",
		name: "Vorspeisen",
		type: "FOOD",
		products: [
			{
				id: 5,
				uuid: "vorspeisenteller",
				price: 14.7,
				name: "Vorspeisenteller",
				variations: []
			}
		]
	}

	foodCategories: Category[] = [
		{
			uuid: "vorspeisen",
			name: "Vorspeisen",
			type: "FOOD",
			products: [
				{
					id: 5,
					uuid: "vorspeisenteller",
					price: 14.7,
					name: "Vorspeisenteller",
					variations: []
				}
			]
		},
		{
			uuid: "hauptgerichte",
			name: "Hauptgerichte",
			type: "FOOD",
			products: [
				{
					id: 6,
					uuid: "rinderfilet",
					price: 35.7,
					name: "Rinderfilet",
					variations: []
				}
			]
		},
		{
			uuid: "beilagen",
			name: "Beilagen",
			type: "FOOD",
			products: [
				{
					id: 7,
					uuid: "pommes",
					price: 4.7,
					name: "Pommes",
					variations: []
				}
			]
		},
		{
			uuid: "dessert",
			name: "Dessert",
			type: "FOOD",
			products: [
				{
					id: 8,
					uuid: "tiramisu",
					price: 6.4,
					name: "Tiramisu",
					variations: []
				}
			]
		}
	]

	menus: Menu[] = [
		{
			uuid: "menu_1",
			name: "Tageskarte",
			id: 1,
			offerType: undefined,
			discountType: undefined,
			offerValue: 0,
			selectedProducts: [],
			validity: {
				startDate: undefined,
				endDate: undefined,
				startTime: undefined,
				endTime: undefined,
				weekdays: []
			},
			items: [
				{
					uuid: "item_1",
					name: "Vorspeise",
					categories: [this.foodCategories[0]],
					products: [this.foodCategories[0].products[0]],
					maxSelections: 1
				}
			]
		},
		{
			uuid: "menu_2",
			name: "Abendkarte",
			id: 2,
			offerType: undefined,
			discountType: undefined,
			offerValue: 0,
			selectedProducts: [],
			validity: {
				startDate: undefined,
				endDate: undefined,
				startTime: undefined,
				endTime: undefined,
				weekdays: []
			},
			items: []
		}
	]

	specials: Menu[] = [
		{
			uuid: "special_1",
			name: "Happy Hour Special",
			id: 1,
			offerType: "DISCOUNT",
			discountType: "PERCENTAGE",
			offerValue: 20,
			selectedProducts: [],
			validity: {
				startDate: undefined,
				endDate: undefined,
				startTime: "17:00",
				endTime: "19:00",
				weekdays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
			},
			items: [
				{
					uuid: "special_item_1",
					name: "Happy Hour Getränke",
					categories: [],
					products: [],
					maxSelections: 1
				}
			]
		},
		{
			uuid: "special_2",
			name: "Wochenend-Brunch",
			id: 2,
			offerType: "FIXED_PRICE",
			discountType: undefined,
			offerValue: 15.9,
			selectedProducts: [],
			validity: {
				startDate: undefined,
				endDate: undefined,
				startTime: "10:00",
				endTime: "14:00",
				weekdays: ["SATURDAY", "SUNDAY"]
			},
			items: []
		}
	]

	drinkCategories: Category[] = [
		{
			uuid: "alkoholfrei",
			name: "Alkoholfrei",
			type: "DRINK",
			products: [
				{
					id: 1,
					uuid: "cola",
					price: 5.0,
					name: "Cola 0,5",
					variations: []
				}
			]
		},
		{
			uuid: "bier",
			name: "Bier",
			type: "DRINK",
			products: [
				{
					id: 2,
					uuid: "pils",
					price: 3.7,
					name: "Pils 0,4",
					variations: []
				}
			]
		},
		{
			uuid: "wein",
			name: "Wein",
			type: "DRINK",
			products: [
				{
					id: 3,
					uuid: "grauburunder",
					price: 6.7,
					name: "Grauburunder 0,2",
					variations: []
				}
			]
		},
		{
			uuid: "schnapps",
			name: "Schnapps",
			type: "DRINK",
			products: [
				{
					id: 4,
					uuid: "ouzo",
					price: 3.0,
					name: "Ouzo",
					variations: []
				}
			]
		}
	]

	addCategoryType: "FOOD" | "DRINK" | null = null
	newCategoryName = ""
	editCategory: Category | null = null
	editCategoryName = ""
	selectedTab = 0 // 0 = Produkte, 1 = Variationen, 2 = Menüs, 3 = Specials
	categoryTabIndex = 0 // 0 = Speisen, 1 = Getränke

	setCategory(category: Category) {
		this.selectedCategory = category
		// Optional: Setze categoryTabIndex passend, falls du z.B. von außen eine Kategorie auswählst
		this.categoryTabIndex = category.type === "FOOD" ? 0 : 1
	}

	startAddCategory(type: "FOOD" | "DRINK") {
		this.addCategoryType = type
		this.newCategoryName = ""
		this.editCategory = null
	}

	cancelAddCategory() {
		this.addCategoryType = null
		this.newCategoryName = ""
	}

	addNewCategory(type: "FOOD" | "DRINK") {
		const name = this.newCategoryName.trim()
		if (!name) return
		const newCategory: Category = {
			uuid: "category_" + Date.now(),
			name,
			type,
			products: []
		}
		if (type === "FOOD") {
			this.foodCategories.push(newCategory)
		} else {
			this.drinkCategories.push(newCategory)
		}
		this.selectedCategory = newCategory
		this.cancelAddCategory()
	}

	startEditCategory(category: Category) {
		this.editCategory = category
		this.editCategoryName = category.name
		this.addCategoryType = null
	}

	cancelEditCategory() {
		this.editCategory = null
		this.editCategoryName = ""
	}

	saveEditCategory() {
		if (this.editCategory && this.editCategoryName.trim()) {
			this.editCategory.name = this.editCategoryName.trim()
			this.editCategory = null
			this.editCategoryName = ""
		}
	}

	deleteCategory(category: Category) {
		if (category.type === "FOOD") {
			this.foodCategories = this.foodCategories.filter(
				c => c.uuid !== category.uuid
			)
		} else {
			this.drinkCategories = this.drinkCategories.filter(
				c => c.uuid !== category.uuid
			)
		}
		if (this.selectedCategory?.uuid === category.uuid) {
			this.selectedCategory =
				this.foodCategories[0] || this.drinkCategories[0] || null
		}
	}

	getAllCategories(): Category[] {
		return [...this.foodCategories, ...this.drinkCategories]
	}
}
