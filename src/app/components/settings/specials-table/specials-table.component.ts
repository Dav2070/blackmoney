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
import {
	SpecialsTableDataSource,
	SpecialsTableItem
} from "./specials-table-datasource"
import { Category } from "src/app/models/Category"
import { Menu, Weekday, MenuItem } from "src/app/models/Menu"
import { Product } from "src/app/models/Product"

@Component({
	selector: "app-specials-table",
	templateUrl: "./specials-table.component.html",
	styleUrl: "./specials-table.component.scss",
	standalone: false
})
export class SpecialsTableComponent implements AfterViewInit, OnChanges {
	@ViewChild(MatPaginator) paginator!: MatPaginator
	@ViewChild(MatSort) sort!: MatSort
	@ViewChild(MatTable) table!: MatTable<SpecialsTableItem>
	@Input() specials: Menu[] = []
	@Input() availableCategories: Category[] = []

	dataSource: SpecialsTableDataSource = new SpecialsTableDataSource([])
	editingSpecial: Menu | null = null
	newSpecial: Menu | null = null
	expandedSpecial: Menu | null = null
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
		if (changes["specials"] && changes["specials"].currentValue) {
			this.initializeDataSource()
			this.cancelEdit()
		}
	}

	initializeDataSource(): void {
		if (this.specials) {
			this.dataSource = new SpecialsTableDataSource(this.specials)

			if (this.sort && this.paginator && this.table) {
				this.dataSource.sort = this.sort
				this.dataSource.paginator = this.paginator
				this.table.dataSource = this.dataSource
			}
		}
	}

	// Special CRUD
	addNewSpecial(): void {
		this.newSpecial = {
			uuid: "special_" + Date.now(),
			id: this.specials.length + 1,
			name: "Neues Special",
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

		this.specials.push(this.newSpecial)
		this.initializeDataSource()
		this.editingSpecial = this.newSpecial
	}

	deleteSpecial(special: Menu): void {
		const index = this.specials.findIndex(s => s.uuid === special.uuid)
		if (index !== -1) {
			this.specials.splice(index, 1)
			this.initializeDataSource()
		}
	}

	editSpecial(special: Menu): void {
		this.editingSpecial = special
	}

	saveSpecial(special: Menu): void {
		this.editingSpecial = null
		this.newSpecial = null
		this.initializeDataSource()
	}

	cancelEdit(): void {
		if (this.newSpecial) {
			const index = this.specials.findIndex(
				special => special === this.newSpecial
			)
			if (index !== -1) {
				this.specials.splice(index, 1)
			}
		}

		this.editingSpecial = null
		this.newSpecial = null
		this.initializeDataSource()
	}

	// Expand/Collapse
	toggleExpandSpecial(special: Menu): void {
		this.expandedSpecial = this.expandedSpecial === special ? null : special
		this.editingItem = null
		this.newItem = null
	}

	// Item CRUD - Limited to one item per special
	addNewItem(special: Menu): void {
		// Check if special already has an item
		if (special.items.length > 0) {
			return // Don't allow adding more than one item
		}

		this.newItem = {
			uuid: "item_" + Date.now(),
			name: "Neues Item",
			categories: [],
			products: [],
			maxSelections: 1
		}

		special.items.push(this.newItem)
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

	cancelItemEdit(special: Menu): void {
		if (this.newItem) {
			const index = special.items.findIndex(item => item === this.newItem)
			if (index !== -1) {
				special.items.splice(index, 1)
			}
		}
		this.editingItem = null
		this.newItem = null
	}

	deleteItem(special: Menu, item: MenuItem): void {
		const index = special.items.findIndex(i => i.uuid === item.uuid)
		if (index !== -1) {
			special.items.splice(index, 1)
		}
	}

	// Check if special can have an item added
	canAddItem(special: Menu): boolean {
		return special.items.length === 0
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

	toggleWeekday(special: Menu, weekday: Weekday): void {
		const index = special.validity.weekdays.indexOf(weekday)
		if (index > -1) {
			special.validity.weekdays.splice(index, 1)
		} else {
			special.validity.weekdays.push(weekday)
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

	isWeekdaySelected(special: Menu, weekday: Weekday): boolean {
		return special.validity.weekdays.includes(weekday)
	}
}
