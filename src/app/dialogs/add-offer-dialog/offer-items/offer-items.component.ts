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
	expandedProducts: Map<string, boolean> = new Map()
	editingItem: OfferItem | null = null
	// productUuid -> variationUuid -> VariationItem[]
	newItemSelectedVariations: Map<string, Map<string, any[]>> = new Map()

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
			// Initialisiere alle Variationen mit allen VariationItems
			if (product.variations && product.variations.length > 0) {
				const variationsMap = new Map<string, any[]>()
				product.variations.forEach(variation => {
					variationsMap.set(variation.uuid, [...variation.variationItems])
				})
				this.newItemSelectedVariations.set(product.uuid, variationsMap)
				// Automatisch aufklappen
				this.expandedProducts.set(product.uuid, true)
			}
		} else {
			this.newItemProducts.splice(index, 1)
			this.newItemSelectedVariations.delete(product.uuid)
			// Zuklappen beim Abwählen
			this.expandedProducts.set(product.uuid, false)
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
			// Initialisiere alle Variationen mit allen VariationItems
			if (product.variations && product.variations.length > 0) {
				if (!item.selectedVariations) {
					item.selectedVariations = new Map()
				}
				const variationsMap = new Map<string, any[]>()
				product.variations.forEach(variation => {
					variationsMap.set(variation.uuid, [...variation.variationItems])
				})
				item.selectedVariations.set(product.uuid, variationsMap)
				// Automatisch aufklappen
				this.expandedProducts.set(product.uuid, true)
			}
		} else {
			item.products.splice(index, 1)
			if (item.selectedVariations) {
				item.selectedVariations.delete(product.uuid)
			}
			// Zuklappen beim Abwählen
			this.expandedProducts.set(product.uuid, false)
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
			this.editingItem.selectedVariations = new Map(
				this.newItemSelectedVariations
			)
			this.editingItem = null
		} else {
			// Add new item
			const newItem: OfferItem = {
				uuid: crypto.randomUUID(),
				name: this.newItemName,
				maxSelections: this.newItemMaxSelections,
				products: [...this.newItemProducts],
				selectedVariations: new Map(this.newItemSelectedVariations)
			}
			this.offerItems.push(newItem)
		}

		this.offerItemsChange.emit(this.offerItems)

		// Reset
		this.newItemName = ""
		this.newItemMaxSelections = 1
		this.newItemProducts = []
		this.newItemSelectedVariations = new Map()
		this.newItemNameError = ""
		this.errorsClear.emit()
	}

	editOfferItem(item: OfferItem) {
		this.editingItem = item
		this.newItemName = item.name
		this.newItemMaxSelections = item.maxSelections
		this.newItemProducts = [...item.products]
		this.newItemSelectedVariations = item.selectedVariations
			? new Map(item.selectedVariations)
			: new Map()
		this.newItemNameError = ""
	}

	cancelEdit() {
		this.editingItem = null
		this.newItemName = ""
		this.newItemMaxSelections = 1
		this.newItemProducts = []
		this.newItemSelectedVariations = new Map()
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

	getSelectedCountInCategory(categoryUuid: string): number {
		const category = this.getProductsByCategory().find(
			c => c.categoryUuid === categoryUuid
		)
		if (!category) return 0

		if (this.isSpecialMode && this.offerItems.length > 0) {
			// Im Special-Modus: Zähle ausgewählte Produkte im ersten Item
			return category.products.filter(product =>
				this.offerItems[0].products.some(p => p.uuid === product.uuid)
			).length
		} else {
			// Im Menü-Modus: Zähle ausgewählte Produkte im aktuellen neuen Item
			return category.products.filter(product =>
				this.newItemProducts.some(p => p.uuid === product.uuid)
			).length
		}
	}

	toggleProductExpanded(productUuid: string) {
		this.expandedProducts.set(
			productUuid,
			!this.expandedProducts.get(productUuid)
		)
	}

	isProductExpanded(productUuid: string): boolean {
		return this.expandedProducts.get(productUuid) || false
	}

	// Variation Item Toggle für Menü-Modus
	toggleVariationItem(productUuid: string, variationUuid: string, item: any) {
		const productVariations = this.newItemSelectedVariations.get(productUuid)
		if (!productVariations) return

		const selectedItems = productVariations.get(variationUuid) || []
		const index = selectedItems.findIndex((i: any) => i.uuid === item.uuid)

		if (index === -1) {
			selectedItems.push(item)
		} else {
			selectedItems.splice(index, 1)
		}

		productVariations.set(variationUuid, selectedItems)
	}

	isVariationItemSelected(
		productUuid: string,
		variationUuid: string,
		item: any
	): boolean {
		const productVariations = this.newItemSelectedVariations.get(productUuid)
		if (!productVariations) return false

		const selectedItems = productVariations.get(variationUuid) || []
		return selectedItems.some((i: any) => i.uuid === item.uuid)
	}

	// Variation Item Toggle für Special-Modus
	toggleVariationItemForItem(
		item: OfferItem,
		productUuid: string,
		variationUuid: string,
		variationItem: any
	) {
		if (!item.selectedVariations) {
			item.selectedVariations = new Map()
		}

		const productVariations = item.selectedVariations.get(productUuid)
		if (!productVariations) return

		const selectedItems = productVariations.get(variationUuid) || []
		const index = selectedItems.findIndex(
			(i: any) => i.uuid === variationItem.uuid
		)

		if (index === -1) {
			selectedItems.push(variationItem)
		} else {
			selectedItems.splice(index, 1)
		}

		productVariations.set(variationUuid, selectedItems)
		this.offerItemsChange.emit(this.offerItems)
	}

	isVariationItemSelectedForItem(
		item: OfferItem,
		productUuid: string,
		variationUuid: string,
		variationItem: any
	): boolean {
		if (!item.selectedVariations) return false

		const productVariations = item.selectedVariations.get(productUuid)
		if (!productVariations) return false

		const selectedItems = productVariations.get(variationUuid) || []
		return selectedItems.some((i: any) => i.uuid === variationItem.uuid)
	}
}
