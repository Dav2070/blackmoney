import { Component, Input, OnInit, ViewChild, ElementRef, HostListener } from "@angular/core"
import { Router } from "@angular/router"
import { Category } from "src/app/models/Category"
import { Product } from "src/app/models/Product"
import { Variation } from "src/app/models/Variation"
import { VariationItem } from "src/app/models/VariationItem"
import { faPen, faTrash } from "@fortawesome/pro-regular-svg-icons"
import { faEllipsis } from "@fortawesome/free-solid-svg-icons"
import { ContextMenu } from "dav-ui-components"
import { ProductType } from "src/app/types"

@Component({
	selector: "app-product-list",
	standalone: false,
	templateUrl: "./product-list.component.html",
	styleUrl: "./product-list.component.scss"
})
export class ProductListComponent implements OnInit {
	@Input() category: Category
	@Input() activeTab: string = "food"

	products: Product[] = []
	productType: ProductType = "FOOD"
	faPen = faPen
	faTrash = faTrash
	faEllipsis = faEllipsis

	// Variation tooltip overlay state
	variationTooltipVisible = false
	variationTooltipItems: VariationItem[] = []
	variationTooltipTitle = ""
	variationTooltipX = 0
	variationTooltipY = 0
	tooltipHideTimeout: any

	@ViewChild("productContextMenu")
	productContextMenu: ElementRef<ContextMenu>
	contextMenuVisible = false
	contextMenuX = 0
	contextMenuY = 0
	selectedProduct: Product = null

	constructor(private readonly router: Router) {}

	ngOnInit() {
		this.updateProducts()
	}

	ngOnChanges() {
		this.updateProducts()
	}

	private updateProducts() {
		if (!this.category) {
			this.products = []
			return
		}
		this.productType = this.mapPathToType(this.activeTab)
		this.products = (this.category.products as Product[])?.filter(
			p => p.type === this.productType
		) ?? []
	}

	private mapPathToType(path: string): ProductType {
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

	trackByUuid(index: number, item: { uuid: string }) {
		return item.uuid
	}

	editProduct(product: Product) {
		console.log("Edit product:", product)
		// TODO: navigate to edit
	}

	deleteProduct(product: Product) {
		console.log("Delete product:", product)
		const confirmed = confirm(`Produkt "${product.name}" wirklich löschen?`)
		if (!confirmed) return
		this.products = this.products.filter(p => p.uuid !== product.uuid)
	}

	showProductContextMenu(event: Event, product: Product) {
		const detail = (event as CustomEvent).detail
		this.selectedProduct = product
		if (this.contextMenuVisible) {
			this.contextMenuVisible = false
			return
		}
		this.contextMenuX = detail.contextMenuPosition.x
		this.contextMenuY = detail.contextMenuPosition.y
		this.contextMenuVisible = true
	}

	editSelectedProduct() {
		if (!this.selectedProduct) return
		this.editProduct(this.selectedProduct)
		this.contextMenuVisible = false
		this.selectedProduct = null
	}

	deleteSelectedProduct() {
		if (!this.selectedProduct) return
		this.deleteProduct(this.selectedProduct)
		this.contextMenuVisible = false
		this.selectedProduct = null
	}

	showVariationTooltip(event: MouseEvent, variation: Variation) {
		if (this.tooltipHideTimeout) {
			clearTimeout(this.tooltipHideTimeout)
			this.tooltipHideTimeout = null
		}

		const target = event.currentTarget as HTMLElement
		const rect = target.getBoundingClientRect()

		this.variationTooltipTitle = variation.name
		this.variationTooltipItems = variation.variationItems ?? []
		this.variationTooltipX = rect.right - 240
		this.variationTooltipY = rect.bottom + 8
		this.variationTooltipVisible = true
	}

	scheduleHideVariationTooltip() {
		this.tooltipHideTimeout = setTimeout(() => {
			this.variationTooltipVisible = false
			this.variationTooltipItems = []
		}, 120)
	}

	keepTooltipOpen() {
		if (this.tooltipHideTimeout) {
			clearTimeout(this.tooltipHideTimeout)
			this.tooltipHideTimeout = null
		}
	}

	@HostListener("document:click", ["$event"])
	documentClick(event: MouseEvent) {
		if (
			this.contextMenuVisible &&
			!this.productContextMenu?.nativeElement.contains(event.target as Node)
		) {
			this.contextMenuVisible = false
			this.selectedProduct = null
		}
	}
}

