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
import { Variation } from "src/app/models/Variation"
import { formatPrice } from "src/app/utils"

@Component({
	selector: "app-edit-product-dialog",
	templateUrl: "./edit-product-dialog.component.html",
	styleUrls: ["./edit-product-dialog.component.scss"],
	standalone: false
})
export class EditProductDialogComponent {
	locale = this.localizationService.locale.dialogs.addVariationDialog
	actionsLocale = this.localizationService.locale.actions
	faChevronDown = faChevronDown
	faChevronUp = faChevronUp

	@Input() loading: boolean = false
	@Input() nameError: string = ""
	@Input() priceError: string = ""
	@Input() availableVariations: Variation[] = []
	@Output() primaryButtonClick = new EventEmitter<Product>()
	@Output() clearErrors = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>

	visible: boolean = false
	product: Product = null
	productId: string = ""
	name: string = ""
	price: string = ""
	takeaway: boolean = false
	selectedVariationUuids: string[] = []
	expandedVariationUuids: Set<string> = new Set()
	idError: string = ""

	get dialogHeadline(): string {
		if (!this.product) return "Produkt bearbeiten"
		switch (this.product.type) {
			case "DRINK":
				return "Getränk bearbeiten"
			case "SPECIAL":
				return "Special bearbeiten"
			case "MENU":
				return "Menü bearbeiten"
			default:
				return "Speise bearbeiten"
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

	show(product: Product) {
		this.reset()

		// Create a deep copy of the product to avoid mutating the original
		this.product = {
			...product,
			variations: product.variations ? [...product.variations] : []
		}
		this.productId = product.shortcut.toString()
		this.name = product.name
		this.price = (product.price / 100).toFixed(2)
		this.takeaway = product.takeaway
		this.selectedVariationUuids = product.variations.map(v => v.uuid)

		this.expandedVariationUuids.clear()
		this.visible = true
	}

	hide() {
		this.visible = false
		this.reset()
	}

	reset() {
		this.product = null
		this.productId = ""
		this.name = ""
		this.price = ""
		this.takeaway = false
		// Create new array to ensure Angular detects changes
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

		const updatedProduct: Product = {
			...this.product,
			name: this.name.trim(),
			price: priceInCents,
			shortcut: parseInt(this.productId.trim()),
			variations: selectedVariations,
			takeaway: this.takeaway
		}

		this.primaryButtonClick.emit(updatedProduct)
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

	checkboxChanged(variationUuid: string, event: Event) {
		const checked = (event as CustomEvent).detail.checked

		if (checked) {
			if (!this.selectedVariationUuids.includes(variationUuid)) {
				this.selectedVariationUuids.push(variationUuid)
			}
		} else {
			const index = this.selectedVariationUuids.indexOf(variationUuid)
			if (index > -1) {
				this.selectedVariationUuids.splice(index, 1)
			}
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
