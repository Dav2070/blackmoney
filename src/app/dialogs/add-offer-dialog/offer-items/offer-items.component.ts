import { Component, Input, Output, EventEmitter } from "@angular/core"
import { OfferItem } from "src/app/models/OfferItem"
import { Product } from "src/app/models/Product"
import {
	faTrash,
	faChevronRight,
	faChevronDown,
	faPencil
} from "@fortawesome/free-solid-svg-icons"

@Component({
	selector: "app-offer-items",
	templateUrl: "./offer-items.component.html",
	styleUrls: ["./offer-items.component.scss"],
	standalone: false
})
export class OfferItemsComponent {
	faTrash = faTrash
	faChevronRight = faChevronRight
	faChevronDown = faChevronDown
	faPencil = faPencil

	@Input() offerItems: OfferItem[] = []
	@Input() availableProducts: Product[] = []
	@Input() loading: boolean = false
	@Input() locale: any
	@Input() isSpecialMode: boolean = false
	@Input() newItemNameError: string = ""

	@Output() offerItemsChange = new EventEmitter<OfferItem[]>()
	@Output() errorsClear = new EventEmitter<void>()

	newItemName: string = ""
	newItemMaxSelections: number = 1
	newItemProducts: Product[] = []
	expandedCategories: Map<string, boolean> = new Map()
	editingItem: OfferItem | null = null

	newItemNameChange(value: string) {
		this.newItemName = value
		this.newItemNameError = ""
		this.errorsClear.emit()
	}

	newItemMaxSelectionsChange(value: string) {
		this.newItemMaxSelections = parseInt(value) || 1
	}

	// Für neues Item hinzufügen (Menü-Modus)
	toggleProductSelection(product: Product) {
		const index = this.newItemProducts.findIndex(p => p.uuid === product.uuid)
		if (index === -1) {
			this.newItemProducts.push(product)
		} else {
			this.newItemProducts.splice(index, 1)
		}
	}

	isProductSelected(product: Product): boolean {
		return this.newItemProducts.some(p => p.uuid === product.uuid)
	}

	// Für existierende Items bearbeiten (Special-Modus)
	toggleProductSelectionForItem(item: OfferItem, product: Product) {
		const index = item.products.findIndex(p => p.uuid === product.uuid)
		if (index === -1) {
			item.products.push(product)
		} else {
			item.products.splice(index, 1)
		}
		this.offerItemsChange.emit(this.offerItems)
	}

	isProductSelectedForItem(item: OfferItem, product: Product): boolean {
		return item.products.some(p => p.uuid === product.uuid)
	}

	addOfferItem() {
		if (!this.newItemName.trim()) {
			this.newItemNameError = this.locale.itemNameRequired
			return
		}

		if (this.newItemProducts.length === 0) {
			this.newItemNameError = this.locale.productsRequired
			return
		}

		if (this.editingItem) {
			// Update existing item
			this.editingItem.name = this.newItemName
			this.editingItem.maxSelections = this.newItemMaxSelections
			this.editingItem.products = [...this.newItemProducts]
			this.editingItem = null
		} else {
			// Add new item
			const newItem: OfferItem = {
				uuid: crypto.randomUUID(),
				name: this.newItemName,
				maxSelections: this.newItemMaxSelections,
				products: [...this.newItemProducts]
			}
			this.offerItems.push(newItem)
		}

		this.offerItemsChange.emit(this.offerItems)

		// Reset
		this.newItemName = ""
		this.newItemMaxSelections = 1
		this.newItemProducts = []
		this.newItemNameError = ""
		this.errorsClear.emit()
	}

	editOfferItem(item: OfferItem) {
		this.editingItem = item
		this.newItemName = item.name
		this.newItemMaxSelections = item.maxSelections
		this.newItemProducts = [...item.products]
		this.newItemNameError = ""
	}

	cancelEdit() {
		this.editingItem = null
		this.newItemName = ""
		this.newItemMaxSelections = 1
		this.newItemProducts = []
		this.newItemNameError = ""
	}

	removeOfferItem(item: OfferItem) {
		this.offerItems = this.offerItems.filter(i => i.uuid !== item.uuid)
		this.offerItemsChange.emit(this.offerItems)
		if (this.editingItem === item) {
			this.cancelEdit()
		}
	}

	getProductsByCategory(): {
		categoryName: string
		categoryUuid: string
		products: Product[]
	}[] {
		const categoriesMap = new Map<
			string,
			{ categoryName: string; categoryUuid: string; products: Product[] }
		>()

		for (const product of this.availableProducts) {
			const categoryUuid = product.category?.uuid || "uncategorized"
			const categoryName = product.category?.name || "Ohne Kategorie"

			if (!categoriesMap.has(categoryUuid)) {
				categoriesMap.set(categoryUuid, {
					categoryName,
					categoryUuid,
					products: []
				})
			}

			categoriesMap.get(categoryUuid)!.products.push(product)
		}

		return Array.from(categoriesMap.values())
	}

	toggleCategory(categoryUuid: string) {
		this.expandedCategories.set(
			categoryUuid,
			!this.expandedCategories.get(categoryUuid)
		)
	}

	isCategoryExpanded(categoryUuid: string): boolean {
		return this.expandedCategories.get(categoryUuid) || false
	}
}
