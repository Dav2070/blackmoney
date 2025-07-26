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
import { MenuTableDataSource, MenuTableItem } from "./menu-table-datasource"
import { Category } from "src/app/models/Category"
import { Menu, Weekday, MenuItem } from "src/app/models/Menu"
import { Product } from "src/app/models/Product"

@Component({
	selector: "app-menu-table",
	templateUrl: "./menu-table.component.html",
	styleUrl: "./menu-table.component.scss",
	standalone: false
})
export class MenuTableComponent implements AfterViewInit, OnChanges {
	@ViewChild(MatPaginator) paginator!: MatPaginator
	@ViewChild(MatSort) sort!: MatSort
	@ViewChild(MatTable) table!: MatTable<MenuTableItem>
	@Input() menus: Menu[] = []
	@Input() availableCategories: Category[] = []

	dataSource: MenuTableDataSource = new MenuTableDataSource([])
	editingMenu: Menu | null = null
	newMenu: Menu | null = null
	expandedMenu: Menu | null = null
	editingItem: MenuItem | null = null
	newItem: MenuItem | null = null

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
			uuid: "menu_" + Date.now(),
			id: this.menus.length + 1,
			name: "Neues Menü",
			offerType: "NONE",
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

		this.menus.push(this.newMenu)
		this.initializeDataSource()
		this.editingMenu = this.newMenu
	}

	deleteMenu(menu: Menu): void {
		const index = this.menus.findIndex(m => m.uuid === menu.uuid)
		if (index !== -1) {
			this.menus.splice(index, 1)
			this.initializeDataSource()
		}
	}

	editMenu(menu: Menu): void {
		this.editingMenu = menu
	}

	saveMenu(menu: Menu): void {
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
	toggleExpandMenu(menu: Menu): void {
		this.expandedMenu = this.expandedMenu === menu ? null : menu
		this.editingItem = null
		this.newItem = null
	}

	// Item CRUD
	addNewItem(menu: Menu): void {
		this.newItem = {
			uuid: "item_" + Date.now(),
			name: "Neues Item",
			categories: [],
			products: [],
			maxSelections: 1
		}

		menu.items.push(this.newItem)
		this.editingItem = this.newItem
	}

	editItem(item: MenuItem): void {
		this.editingItem = item
		this.newItem = null
	}

	saveItem(): void {
		this.editingItem = null
		this.newItem = null
	}

	cancelItemEdit(menu: Menu): void {
		if (this.newItem) {
			const index = menu.items.findIndex(item => item === this.newItem)
			if (index !== -1) {
				menu.items.splice(index, 1)
			}
		}
		this.editingItem = null
		this.newItem = null
	}

	deleteItem(menu: Menu, item: MenuItem): void {
		const index = menu.items.findIndex(i => i.uuid === item.uuid)
		if (index !== -1) {
			menu.items.splice(index, 1)
		}
	}

	// Product/Category Selection
	toggleProductSelection(item: MenuItem, product: Product): void {
		const index = item.products.findIndex(p => p.uuid === product.uuid)
		if (index > -1) {
			item.products.splice(index, 1)
		} else {
			item.products.push(product)
		}
	}

	toggleCategorySelection(item: MenuItem, category: Category): void {
		const index = item.categories.findIndex(c => c.uuid === category.uuid)
		if (index > -1) {
			item.categories.splice(index, 1)
		} else {
			item.categories.push(category)
		}
		// Produktauswahl aktualisieren
		const availableProducts: Product[] = []
		item.categories.forEach(cat => {
			if (cat.products) {
				availableProducts.push(...cat.products)
			}
		})
		// Nur Produkte behalten, die noch verfügbar sind
		item.products = item.products.filter(product =>
			availableProducts.some(p => p.uuid === product.uuid)
		)
	}

	toggleWeekday(menu: Menu, weekday: Weekday): void {
		const index = menu.validity.weekdays.indexOf(weekday)
		if (index > -1) {
			menu.validity.weekdays.splice(index, 1)
		} else {
			menu.validity.weekdays.push(weekday)
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

	isCategorySelected(item: MenuItem, category: Category): boolean {
		return item.categories.some(c => c.uuid === category.uuid)
	}

	isProductSelected(item: MenuItem, product: Product): boolean {
		return item.products.some(p => p.uuid === product.uuid)
	}

	isWeekdaySelected(menu: Menu, weekday: Weekday): boolean {
		return menu.validity.weekdays.includes(weekday)
	}
}
