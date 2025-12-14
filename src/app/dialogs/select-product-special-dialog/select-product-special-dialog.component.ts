import {
	Component,
	Input,
	Output,
	EventEmitter,
	ViewChild,
	ElementRef,
	Inject,
	PLATFORM_ID
} from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { Dialog } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"
import { Product } from "src/app/models/Product"
import { Category } from "src/app/models/Category"
import { OrderItem } from "src/app/models/OrderItem"
import { SelectProductVariationsDialogComponent } from "src/app/dialogs/select-product-variations-dialog/select-product-variations-dialog.component"
import { AllItemHandler } from "src/app/models/cash-register/order-item-handling/all-item-handler.model"
import { OrderItemType } from "src/app/types"
import { VariationItem } from "src/app/models/VariationItem"

@Component({
	selector: "app-select-product-special-dialog",
	templateUrl: "./select-product-special-dialog.component.html",
	styleUrl: "./select-product-special-dialog.component.scss",
	standalone: false
})
export class SelectProductSpecialDialogComponent {
	locale = this.localizationService.locale.dialogs.selectProductSpecialDialog
	actionsLocale = this.localizationService.locale.actions
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	@Input() product: Product = null
	@Output() primaryButtonClick = new EventEmitter<{
		orderItems: OrderItem[]
	}>()
	visible: boolean = false
	selectProductVariationsDialogVisible: boolean = false
	categories: Category[] = []
	selectedCategory: Category = null
	selectedProducts: Product[] = []
	allItemHandler: AllItemHandler = new AllItemHandler()

	@ViewChild("selectProductVariationsDialog")
	selectProductVariationsDialog: SelectProductVariationsDialogComponent
	selectedProduct: Product = null

	constructor(
		private localizationService: LocalizationService,
		@Inject(PLATFORM_ID) private platformId: object
	) {}

	ngAfterViewInit() {
		if (isPlatformBrowser(this.platformId)) {
			document.body.appendChild(this.dialog.nativeElement)
		}
	}

	ngOnDestroy() {
		if (isPlatformBrowser(this.platformId)) {
			document.body.removeChild(this.dialog.nativeElement)
		}
	}

	selectCategory(category: Category) {
		this.selectedCategory = category
		this.selectedProducts = []

		for (const offerItem of this.product.offer.offerItems) {
			for (const product of offerItem.products) {
				if (product.category.uuid === category.uuid) {
					this.selectedProducts.push(product)
				}
			}
		}
	}

	selectProduct(product: Product) {
		if (product.variations.length === 0) {
			this.allItemHandler.pushNewItem({
				uuid: crypto.randomUUID(),
				type: OrderItemType.Product,
				count: 1,
				order: null,
				product,
				orderItems: [],
				orderItemVariations: []
			})
		} else {
			// Open variations dialog
			this.selectedProduct = product
			this.selectProductVariationsDialogVisible = true
			this.selectProductVariationsDialog.show()
		}
	}

	counterChange(orderItem: OrderItem, count: number) {
		orderItem.count = count

		if (orderItem.count === 0) {
			this.allItemHandler.deleteItem(orderItem)
		}
	}

	selectProductVariationsDialogPrimaryButtonClick(event: {
		variationTree: { [key: string]: number }[]
	}) {
		this.selectProductVariationsDialogVisible = false
		this.selectProductVariationsDialog.hide()

		const lastVariationTree = event.variationTree.pop()
		const allVariationItems = this.selectedProduct.variations
			.map(v => v.variationItems)
			.flat()

		let newItem: OrderItem = {
			uuid: crypto.randomUUID(),
			type: OrderItemType.Product,
			count: 1,
			order: null,
			product: this.selectedProduct,
			orderItems: [],
			orderItemVariations: []
		}

		for (const key of Object.keys(lastVariationTree)) {
			const value = lastVariationTree[key]
			if (value === 0) continue

			const variationItems: VariationItem[] = []

			for (const variationItemUuid of key.split(",")) {
				const item = allVariationItems.find(
					vi => vi.uuid === variationItemUuid
				)
				if (item) variationItems.push(item)
			}

			newItem.orderItemVariations.push({
				uuid: crypto.randomUUID(),
				count: value,
				variationItems
			})
		}

		if (this.selectedProduct?.type === OrderItemType.Special) {
			let incoming = JSON.parse(JSON.stringify(this.selectProduct))

			newItem.count = 0

			for (let variation of newItem.orderItemVariations) {
				newItem.count += variation.count
			}

			incoming.orderItems = [newItem]
			incoming.count = newItem.count
			this.allItemHandler.pushNewItem(incoming)
		} else {
			newItem.count = newItem.orderItemVariations.length
			this.allItemHandler.pushNewItem(newItem)
		}
	}

	dismissSelectProductVariationsDialog() {
		if (this.selectProductVariationsDialogVisible) {
			this.selectProductVariationsDialogVisible = false
			this.selectProductVariationsDialog.hide()
		}
	}

	dismiss() {
		if (this.allItemHandler.isEmpty()) {
			this.hide()
		}
	}

	show() {
		setTimeout(() => {
			// Get the categories of the special
			this.categories = []

			for (const offerItem of this.product.offer.offerItems) {
				for (const product of offerItem.products) {
					if (
						!this.categories.some(
							cat => cat.uuid === product.category.uuid
						)
					) {
						this.categories.push(product.category)
					}
				}
			}

			if (this.categories.length > 0) {
				this.selectCategory(this.categories[0])
			}

			this.allItemHandler.clearItems()
			this.visible = true
		}, 200)
	}

	hide() {
		this.visible = false
	}

	submit() {
		if (!this.allItemHandler.isEmpty()) {
			this.primaryButtonClick.emit({
				orderItems: this.allItemHandler.getAllPickedItems()
			})
		}
	}
}
