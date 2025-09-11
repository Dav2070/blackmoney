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
import { ItemsTableDataSource, ItemsTableItem } from "./items-table-datasource"
import { Product } from "src/app/models/Product"
import { Category } from "src/app/models/Category"
import { Variation } from "src/app/models/Variation"

@Component({
	selector: "app-items-table",
	templateUrl: "./items-table.component.html",
	styleUrl: "./items-table.component.scss",
	standalone: false
})
export class ItemsTableComponent implements AfterViewInit, OnChanges {
	@ViewChild(MatPaginator) paginator!: MatPaginator
	@ViewChild(MatSort) sort!: MatSort
	@ViewChild(MatTable) table!: MatTable<ItemsTableItem>
	@Input() category: Category
	@Input() availableVariations: Variation[] = []

	dataSource: ItemsTableDataSource = new ItemsTableDataSource([])
	editingProduct: Product | null = null
	newProduct: Product | null = null

	displayedColumns = ["id", "name", "price", "variations", "actions"]

	ngAfterViewInit(): void {
		this.initializeDataSource()
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes["category"] && changes["category"].currentValue) {
			this.initializeDataSource()
			this.cancelEdit()
		}
	}

	initializeDataSource(): void {
		if (this.category && this.category.products) {
			this.dataSource = new ItemsTableDataSource(this.category.products)

			if (this.sort && this.paginator && this.table) {
				this.dataSource.sort = this.sort
				this.dataSource.paginator = this.paginator
				this.table.dataSource = this.dataSource
			}
		}
	}

	addNewProduct(): void {
		// Create a new product with default values
		this.newProduct = {
			id: this.getNextProductId(),
			uuid: "product_" + Date.now(),
			name: "",
			price: 0,
			category: null,
			variations: []
		}

		// Add to category temporarily
		this.category.products.push(this.newProduct)
		this.initializeDataSource()

		// Set it as the currently edited product
		this.editingProduct = this.newProduct
	}

	deleteProduct(product: Product): void {
		const index = this.category.products.findIndex(
			p => p.uuid === product.uuid
		)
		if (index !== -1) {
			this.category.products.splice(index, 1)
			this.initializeDataSource()
		}
	}

	getNextProductId(): number {
		return this.category.products.length > 0
			? Math.max(...this.category.products.map(product => product.id)) + 1
			: 1
	}

	editProduct(product: Product): void {
		this.editingProduct = product
	}

	saveProduct(product: Product): void {
		this.editingProduct = null
		this.newProduct = null
		this.initializeDataSource()
	}

	cancelEdit(): void {
		if (this.newProduct) {
			const index = this.category.products.findIndex(
				product => product === this.newProduct
			)
			if (index !== -1) {
				this.category.products.splice(index, 1)
			}
		}

		this.editingProduct = null
		this.newProduct = null
		this.initializeDataSource()
	}

	isEditing(product: Product): boolean {
		return product === this.editingProduct
	}

	getSelectedCategories(product: Product): string[] {
		if (!product.variations || product.variations.length === 0) return []

		return product.variations.map(variation => variation.uuid)
	}

	updateProductVariations(
		product: Product,
		selectedVariationIds: string[]
	): void {
		if (!product.variations) {
			product.variations = []
		} else {
			product.variations = []
		}

		// Für jede ausgewählte Variation eine Kopie zum Produkt hinzufügen
		for (const variationId of selectedVariationIds) {
			const variation = this.availableVariations.find(
				v => v.uuid === variationId
			)
			if (variation) {
				product.variations.push({ ...variation })
			}
		}
	}

	getVariationItemsTooltip(product: Product, variation: Variation): string {
		if (!variation.variationItems || variation.variationItems.length === 0)
			return "Keine Einträge"

		return variation.variationItems
			.map(varItem => {
				const priceStr =
					varItem.additionalCost !== 0
						? ` (${varItem.additionalCost > 0 ? "+" : ""}${varItem.additionalCost}€)`
						: ""
				return `• ${varItem.name}${priceStr}`
			})
			.join("\n")
	}
}
