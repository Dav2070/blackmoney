import {
	Component,
	Input,
	ViewChild,
	ElementRef,
	Inject,
	PLATFORM_ID
} from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { Menu } from "src/app/models/Menu"
import { Product } from "src/app/models/Product"
import { Variation } from "src/app/models/Variation"
import { faList } from "@fortawesome/pro-regular-svg-icons"
import { formatPrice } from "src/app/utils"
import { LocalizationService } from "src/app/services/localization-service"
import { Dialog } from "dav-ui-components"

@Component({
	selector: "app-view-menu-dialog",
	templateUrl: "./view-menu-dialog.component.html",
	styleUrl: "./view-menu-dialog.component.scss",
	standalone: false
})
export class ViewMenuDialogComponent {
	@Input() menu: Menu = null
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false
	selectedCategoryId: string | null = null
	formatPrice = formatPrice
	locale = this.localizationService.locale.dialogs.viewMenuDialog

	faList = faList

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

	open() {
		this.visible = true
	}

	close() {
		this.visible = false
	}

	getVariationTooltip(variation: Variation): string {
		if (!variation.variationItems || variation.variationItems.length === 0) {
			return variation.name
		}

		const items = variation.variationItems
			.map(item => {
				const cost =
					item.additionalCost > 0
						? ` (+${formatPrice(item.additionalCost)})`
						: ""
				return `${item.name}${cost}`
			})
			.join(", ")

		return `${variation.name}: ${items}`
	}

	selectCategory(categoryId: string | null) {
		this.selectedCategoryId = categoryId
	}

	getFilteredProducts(): Product[] {
		if (!this.menu || !this.menu.categories) {
			return []
		}

		if (this.selectedCategoryId === null) {
			// Return all products from all categories
			return this.menu.categories.reduce((products, category) => {
				return products.concat(category.products || [])
			}, [] as Product[])
		}

		// Return products from selected category
		const category = this.menu.categories.find(
			c => c.uuid === this.selectedCategoryId
		)
		return category?.products || []
	}

	getSelectedCategoryName(): string {
		if (this.selectedCategoryId === null) {
			return this.locale.allProducts
		}

		const category = this.menu?.categories?.find(
			c => c.uuid === this.selectedCategoryId
		)
		return category?.name || ""
	}

	getTotalProductCount(): number {
		if (!this.menu || !this.menu.categories) {
			return 0
		}

		return this.menu.categories.reduce((count, category) => {
			return count + (category.products?.length || 0)
		}, 0)
	}
}
