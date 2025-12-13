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
	@Output() primaryButtonClick = new EventEmitter()
	visible: boolean = false
	categories: Category[] = []
	selectedCategory: Category = null

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
				this.selectedCategory = this.categories[0]
			}

			this.visible = true
		}, 200)
	}

	hide() {
		this.visible = false
	}
}
