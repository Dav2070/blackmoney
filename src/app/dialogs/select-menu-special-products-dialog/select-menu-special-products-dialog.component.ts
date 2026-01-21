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
import { OrderItemVariation } from "src/app/models/OrderItemVariation"
import { OfferItem } from "src/app/models/OfferItem"

@Component({
	selector: "app-select-menu-special-products-dialog",
	templateUrl: "./select-menu-special-products-dialog.component.html",
	styleUrl: "./select-menu-special-products-dialog.component.scss",
	standalone: false
})
export class SelectMenuSpecialProductsDialogComponent {
	locale =
		this.localizationService.locale.dialogs.selectMenuSpecialProductsDialog
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
	selectedOfferItem: OfferItem = null
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

	selectOfferItem(offerItem: OfferItem) {
		this.selectedOfferItem = offerItem

		this.selectedProducts = []

		for (const product of offerItem.products) {
			this.selectedProducts.push(product)
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

			if (this.product.type === OrderItemType.Menu) {
				this.selectedOfferItem.maxSelections--

				if (this.selectedOfferItem.maxSelections <= 0) {
					// Auto select next offer item
					const i = this.product.offer.offerItems.findIndex(
						oi => oi.uuid === this.selectedOfferItem.uuid
					)

					if (i + 1 < this.product.offer.offerItems.length) {
						this.selectOfferItem(this.product.offer.offerItems[i + 1])
					}
				}
			}
		} else {
			// Open variations dialog
			this.selectedProduct = product
			this.selectProductVariationsDialogVisible = true
			this.selectProductVariationsDialog.show()
		}
	}

	getVariationHeadline(
		productName: string,
		orderItemVariation: OrderItemVariation
	): string {
		const itemNames: string[] = orderItemVariation.variationItems.map(
			vi => vi.name
		)

		return `${productName} (${itemNames.join(", ")})`
	}

	counterChange(orderItem: OrderItem, count: number) {
		orderItem.count = count

		if (orderItem.count === 0) {
			this.allItemHandler.deleteItem(orderItem)
		}

		// Find the offer item and update max selections
		if (this.product.type === OrderItemType.Menu) {
			const offerItem = this.product.offer.offerItems.find(oi =>
				oi.products.some(p => p.uuid === orderItem.product.uuid)
			)

			if (offerItem) offerItem.maxSelections++
		}
	}

	variationCounterChange(
		orderItem: OrderItem,
		orderItemVariation: OrderItemVariation,
		count: number
	) {
		orderItemVariation.count = count

		if (orderItemVariation.count === 0) {
			orderItem.orderItemVariations = orderItem.orderItemVariations.filter(
				oiv => oiv.uuid !== orderItemVariation.uuid
			)

			if (orderItem.orderItemVariations.length === 0) {
				this.allItemHandler.deleteItem(orderItem)
			}
		}

		// Find the offer item and update max selections
		if (this.product.type === OrderItemType.Menu) {
			const offerItem = this.product.offer.offerItems.find(oi =>
				oi.products.some(p => p.uuid === orderItem.product.uuid)
			)

			if (offerItem) offerItem.maxSelections++
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

		let totalCount = 0
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
			newItem.count = 0
			for (let variation of newItem.orderItemVariations) {
				newItem.count += variation.count
			}
			this.allItemHandler.pushNewItem(newItem)

			// Nur bei OfferItems (Menü) maxSelections verringern
			if (this.selectedOfferItem) {
				this.selectedOfferItem.maxSelections -= totalCount
			}
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
			if (
				this.product.type === OrderItemType.Menu &&
				this.product.offer.offerItems.length > 0
			) {
				this.selectedOfferItem = this.product.offer.offerItems[0]
			}

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
