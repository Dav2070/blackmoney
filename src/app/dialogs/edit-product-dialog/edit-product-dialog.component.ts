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
	renderCheckboxes: boolean = true
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
		console.log('[EDIT-DIALOG] show() called for product:', product.name, product.uuid)
		console.log('[EDIT-DIALOG] Product variations:', product.variations?.map(v => ({ uuid: v.uuid, name: v.name })))
		
		// Force re-render of checkboxes
		this.renderCheckboxes = false
		
		// Reset first to clear previous state
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
		// Create new array to ensure Angular detects changes
		this.selectedVariationUuids = [
			...(product.variations?.map(v => v.uuid) || [])
		]
		
		console.log('[EDIT-DIALOG] selectedVariationUuids after init:', this.selectedVariationUuids)
		this.expandedVariationUuids.clear()
		this.visible = true
		
		// Re-enable checkboxes rendering after Angular processes the change
		setTimeout(() => {
			this.renderCheckboxes = true
		}, 0)
	}

	hide() {
		this.visible = false
		this.reset()
	}

	reset() {
		console.log('[EDIT-DIALOG] reset() called')
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
		console.log('[EDIT-DIALOG] reset() done, selectedVariationUuids:', this.selectedVariationUuids)
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
		
		console.log('[EDIT-DIALOG] submit() - selectedVariationUuids:', [...this.selectedVariationUuids])
		console.log('[EDIT-DIALOG] submit() - selectedVariations:', selectedVariations.map(v => ({ uuid: v.uuid, name: v.name })))

		const updatedProduct: Product = {
			...this.product,
			name: this.name.trim(),
			price: priceInCents,
			shortcut: parseInt(this.productId.trim()),
			variations: selectedVariations,
			takeaway: this.takeaway
		}
		
		console.log('[EDIT-DIALOG] submit() - updatedProduct:', updatedProduct.name, updatedProduct.variations.map(v => ({ uuid: v.uuid, name: v.name })))

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

	toggleVariationSelection(variationUuid: string) {
		console.log('[EDIT-DIALOG] toggleVariationSelection called for:', variationUuid)
		console.log('[EDIT-DIALOG] Before toggle:', [...this.selectedVariationUuids])
		
		const index = this.selectedVariationUuids.indexOf(variationUuid)
		if (index > -1) {
			// Create new array instead of mutating
			this.selectedVariationUuids = this.selectedVariationUuids.filter(
				uuid => uuid !== variationUuid
			)
			console.log('[EDIT-DIALOG] Removed variation')
		} else {
			// Create new array instead of mutating
			this.selectedVariationUuids = [...this.selectedVariationUuids, variationUuid]
			console.log('[EDIT-DIALOG] Added variation')
		}
		
		console.log('[EDIT-DIALOG] After toggle:', [...this.selectedVariationUuids])
	}

	checkboxChanged(variationUuid: string, checked: boolean) {
		console.log('[EDIT-DIALOG] checkboxChanged:', variationUuid, 'checked:', checked)
		const isCurrentlySelected = this.selectedVariationUuids.includes(variationUuid)
		
		if (checked && !isCurrentlySelected) {
			this.selectedVariationUuids = [...this.selectedVariationUuids, variationUuid]
			console.log('[EDIT-DIALOG] Added via checkbox')
		} else if (!checked && isCurrentlySelected) {
			this.selectedVariationUuids = this.selectedVariationUuids.filter(
				uuid => uuid !== variationUuid
			)
			console.log('[EDIT-DIALOG] Removed via checkbox')
		}
		
		console.log('[EDIT-DIALOG] After checkbox change:', [...this.selectedVariationUuids])
	}

	isVariationSelected(variationUuid: string): boolean {
		const isSelected = this.selectedVariationUuids.includes(variationUuid)
		// console.log('[EDIT-DIALOG] isVariationSelected', variationUuid, ':', isSelected, 'from', this.selectedVariationUuids)
		return isSelected
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
