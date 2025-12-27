import {
	Component,
	ElementRef,
	EventEmitter,
	Inject,
	Input,
	Output,
	PLATFORM_ID,
	ViewChild
} from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { Dialog } from "dav-ui-components"
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"
import { LocalizationService } from "src/app/services/localization-service"
import { Product } from "src/app/models/Product"
import { Category } from "src/app/models/Category"
import { Variation } from "src/app/models/Variation"
import { ProductType } from "src/app/types"

@Component({
	selector: "app-add-product-dialog",
	templateUrl: "./add-product-dialog.component.html",
	styleUrls: ["./add-product-dialog.component.scss"],
	standalone: false
})
export class AddProductDialogComponent {
	locale = this.localizationService.locale.dialogs.addVariationDialog
	actionsLocale = this.localizationService.locale.actions
	faChevronDown = faChevronDown
	faChevronUp = faChevronUp

	@Input() loading: boolean = false
	@Input() nameError: string = ""
	@Input() priceError: string = ""
	@Input() category: Category
	@Input() productType: ProductType = "FOOD"
	@Input() availableVariations: Variation[] = []
	@Output() primaryButtonClick = new EventEmitter<Product>()
	@Output() clearErrors = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>

	visible: boolean = false
	productId: string = ""
	name: string = ""
	price: string = ""
	takeaway: boolean = false
	selectedVariationUuids: string[] = []
	expandedVariationUuids: Set<string> = new Set()
	idError: string = ""

	get dialogHeadline(): string {
		switch (this.productType) {
			case "DRINK":
				return "Neues Getränk"
			case "SPECIAL":
				return "Neues Special"
			case "MENU":
				return "Neues Menü"
			default:
				return "Neue Speise"
		}
	}

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
		this.visible = true
	}

	hide() {
		this.visible = false
		this.reset()
	}

	reset() {
		this.productId = ""
		this.name = ""
		this.price = ""
		this.takeaway = false
		this.selectedVariationUuids = []
		this.expandedVariationUuids.clear()
		this.idError = ""
		this.nameError = ""
		this.priceError = ""
	}

	submit() {
		if (!this.productId.trim()) {
			this.idError = "Produkt-ID erforderlich"
			return
		}

		if (!this.name.trim()) {
			this.nameError = "Produktname erforderlich"
			return
		}

		if (!this.price.trim()) {
			this.priceError = "Preis erforderlich"
			return
		}

		const priceInCents = Math.round(parseFloat(this.price) * 100)
		if (isNaN(priceInCents) || priceInCents < 0) {
			this.priceError = "Ungültiger Preis"
			return
		}

		// Get selected variations
		const selectedVariations = this.availableVariations.filter(v =>
			this.selectedVariationUuids.includes(v.uuid)
		)

		const newProduct: Product = {
			uuid: `prod-${Date.now()}`,
			name: this.name.trim(),
			price: priceInCents,
			shortcut: parseInt(this.productId.trim()),
			type: this.productType,
			category: this.category,
			variations: selectedVariations,
			takeaway: this.takeaway
		}

		this.primaryButtonClick.emit(newProduct)
	}

	productIdTextfieldChange(newValue: string) {
		this.productId = newValue
		this.idError = ""
		this.clearErrors.emit()
	}

	nameTextfieldChange(newValue: string) {
		this.name = newValue
		this.nameError = ""
		this.clearErrors.emit()
	}

	priceTextfieldChange(newValue: string) {
		this.price = newValue
		this.priceError = ""
		this.clearErrors.emit()
	}

	takeawayCheckboxChange(newValue: boolean) {
		this.takeaway = newValue
	}

	toggleVariationSelection(variationUuid: string) {
		const index = this.selectedVariationUuids.indexOf(variationUuid)
		if (index > -1) {
			this.selectedVariationUuids.splice(index, 1)
		} else {
			this.selectedVariationUuids.push(variationUuid)
		}
	}

	isVariationSelected(variationUuid: string): boolean {
		return this.selectedVariationUuids.includes(variationUuid)
	}

	isVariationExpanded(variationUuid: string): boolean {
		return this.expandedVariationUuids.has(variationUuid)
	}

	toggleVariationExpansion(event: Event, variationUuid: string) {
		event.stopPropagation()
		if (this.expandedVariationUuids.has(variationUuid)) {
			this.expandedVariationUuids.delete(variationUuid)
		} else {
			this.expandedVariationUuids.add(variationUuid)
		}
	}

	trackByUuid(index: number, item: { uuid: string }) {
		return item.uuid
	}
}
