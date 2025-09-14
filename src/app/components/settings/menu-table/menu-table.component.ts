import {
	AfterViewInit,
	Component,
	Input,
	OnChanges,
	SimpleChanges,
	ViewChild
} from "@angular/core"
import { MatTable } from "@angular/material/table"
import { MatPaginator } from "@angular/material/paginator"
import { MatSort } from "@angular/material/sort"
import { MenuTableDataSource } from "./menu-table-datasource"
import { Category } from "src/app/models/Category"
import { Offer } from "src/app/models/Offer"
import { OfferItem } from "src/app/models/OfferItem"
import { Product } from "src/app/models/Product"
import { Weekday } from "src/app/types"

@Component({
	selector: "app-menu-table",
	templateUrl: "./menu-table.component.html",
	styleUrl: "./menu-table.component.scss",
	standalone: false
})
export class MenuTableComponent implements AfterViewInit, OnChanges {
	@ViewChild(MatPaginator) paginator!: MatPaginator
	@ViewChild(MatSort) sort!: MatSort
	@ViewChild(MatTable) table!: MatTable<Offer>
	@Input() menus: Offer[] = []
	@Input() availableCategories: Category[] = []

	dataSource: MenuTableDataSource = new MenuTableDataSource([])
	editingMenu: Offer | null = null
	newMenu: Offer | null = null
	expandedMenu: Offer | null = null
	editingItem: OfferItem | null = null
	newItem: OfferItem | null = null

	displayedColumns = ["expand", "id", "name", "Angebot", "Gültig", "actions"]

	weekdays: { value: Weekday; label: string }[] = [
		{ value: "MONDAY", label: "Montag" },
		{ value: "TUESDAY", label: "Dienstag" },
		{ value: "WEDNESDAY", label: "Mittwoch" },
		{ value: "THURSDAY", label: "Donnerstag" },
		{ value: "FRIDAY", label: "Freitag" },
		{ value: "SATURDAY", label: "Samstag" },
		{ value: "SUNDAY", label: "Sonntag" }
	]

	ngAfterViewInit(): void {
		this.initializeDataSource()
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes["menus"] && changes["menus"].currentValue) {
			this.initializeDataSource()
			this.cancelEdit()
		}
	}

	initializeDataSource(): void {
		if (this.menus) {
			this.dataSource = new MenuTableDataSource(this.menus)

			if (this.sort && this.paginator && this.table) {
				this.dataSource.sort = this.sort
				this.dataSource.paginator = this.paginator
				this.table.dataSource = this.dataSource
			}
		}
	}

	// Menu CRUD
	addNewMenu(): void {
		this.newMenu = {
			id: 0,
			uuid: "menu_" + Date.now(),
			name: "Neues Menü",
			offerType: "FIXED_PRICE",
			discountType: undefined,
			offerValue: 0,
			startDate: undefined,
			endDate: undefined,
			startTime: undefined,
			endTime: undefined,
			weekdays: [],
			offerItems: []
		}

		this.menus.push(this.newMenu)
		this.initializeDataSource()
		this.editingMenu = this.newMenu
	}

	deleteMenu(menu: Offer): void {
		const index = this.menus.findIndex(m => m.uuid === menu.uuid)
		if (index !== -1) {
			this.menus.splice(index, 1)
			this.initializeDataSource()
		}
	}

	editMenu(menu: Offer): void {
		this.editingMenu = menu
	}

	saveMenu(menu: Offer): void {
		this.editingMenu = null
		this.newMenu = null
		this.initializeDataSource()
	}

	cancelEdit(): void {
		if (this.newMenu) {
			const index = this.menus.findIndex(menu => menu === this.newMenu)
			if (index !== -1) {
				this.menus.splice(index, 1)
			}
		}

		this.editingMenu = null
		this.newMenu = null
		this.initializeDataSource()
	}

	// Expand/Collapse
	toggleExpandMenu(menu: Offer): void {
		this.expandedMenu = this.expandedMenu === menu ? null : menu
		this.editingItem = null
		this.newItem = null
	}

	// Item CRUD
	addNewItem(menu: Offer): void {
		this.newItem = {
			uuid: "item_" + Date.now(),
			name: "Neues Item",
			products: [],
			maxSelections: 1
		}

		menu.offerItems.push(this.newItem)
		this.editingItem = this.newItem
	}

	editItem(item: OfferItem): void {
		this.editingItem = item
		this.newItem = null
	}

	saveItem(): void {
		this.editingItem = null
		this.newItem = null
	}

	cancelItemEdit(menu: Offer): void {
		if (this.newItem) {
			const index = menu.offerItems.findIndex(item => item === this.newItem)
			if (index !== -1) {
				menu.offerItems.splice(index, 1)
			}
		}
		this.editingItem = null
		this.newItem = null
	}

	deleteItem(menu: Offer, item: OfferItem): void {
		const index = menu.offerItems.findIndex(i => i.uuid === item.uuid)
		if (index !== -1) {
			menu.offerItems.splice(index, 1)
		}
	}

	// Product/Category Selection
	toggleProductSelection(item: OfferItem, product: Product): void {
		const index = item.products.findIndex(p => p.uuid === product.uuid)
		if (index > -1) {
			item.products.splice(index, 1)
		} else {
			item.products.push(product)
		}
	}

	toggleCategorySelection(item: OfferItem, category: Category): void {
		const categories: Category[] = item.products.map(p => p.category)
		const index = categories.findIndex(c => c.uuid === category.uuid)

		if (index > -1) {
			categories.splice(index, 1)
		} else {
			categories.push(category)
		}

		// Produktauswahl aktualisieren
		const availableProducts: Product[] = []
		categories.forEach(cat => {
			if (cat.products) {
				availableProducts.push(...cat.products)
			}
		})

		// Nur Produkte behalten, die noch verfügbar sind
		item.products = item.products.filter(product =>
			availableProducts.some(p => p.uuid === product.uuid)
		)
	}

	toggleWeekday(menu: Offer, weekday: Weekday): void {
		const index = menu.weekdays.indexOf(weekday)
		if (index > -1) {
			menu.weekdays.splice(index, 1)
		} else {
			menu.weekdays.push(weekday)
		}
	}

	// Utility
	parseDateFromInput(dateString: string): Date | undefined {
		return dateString ? new Date(dateString) : undefined
	}

	getWeekdayLabel(weekday: Weekday): string {
		const found = this.weekdays.find(w => w.value === weekday)
		return found ? found.label : weekday
	}

	isCategorySelected(item: OfferItem, category: Category): boolean {
		const categories = item.products.map(p => p.category)
		return categories.some(c => c.uuid === category.uuid)
	}

	isProductSelected(item: OfferItem, product: Product): boolean {
		return item.products.some(p => p.uuid === product.uuid)
	}

	isWeekdaySelected(menu: Offer, weekday: Weekday): boolean {
		return menu.weekdays.includes(weekday)
	}
}
