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
import { LocalizationService } from "src/app/services/localization-service"
import { Offer } from "src/app/models/Offer"
import { OfferItem } from "src/app/models/OfferItem"
import { Product } from "src/app/models/Product"
import { OfferType, DiscountType, Weekday } from "src/app/types"
import { faTrash, faChevronRight, faChevronDown } from "@fortawesome/free-solid-svg-icons"

@Component({
	selector: "app-add-offer-dialog",
	templateUrl: "./add-offer-dialog.component.html",
	styleUrls: ["./add-offer-dialog.component.scss"],
	standalone: false
})
export class AddOfferDialogComponent {
	locale = this.localizationService.locale.addOfferDialog
	actionsLocale = this.localizationService.locale.actions
	faTrash = faTrash
	faChevronRight = faChevronRight
	faChevronDown = faChevronDown

	@Input() loading: boolean = false
	@Input() availableProducts: Product[] = []
	@Input() isSpecialMode: boolean = false
	@Output() primaryButtonClick = new EventEmitter<{
		id: number
		name: string
		price: number
		takeaway: boolean
		offer: any
	}>()
	@Output() clearErrors = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>

	visible: boolean = false
	currentTab: number = 0

	// Tab 1: Grunddaten
	id: number = 0
	name: string = ""
	offerType: OfferType = "FIXED_PRICE"
	offerValue: number = 0
	discountType: DiscountType = "PERCENTAGE"
	takeaway: boolean = false
	idError: string = ""
	nameError: string = ""
	offerValueError: string = ""

	// Tab 2: OfferItems
	offerItems: OfferItem[] = []
	newItemName: string = ""
	newItemMaxSelections: number = 1
	newItemProducts: Product[] = []
	newItemNameError: string = ""
	expandedCategories: Map<string, boolean> = new Map()

	// Tab 3: Zeiten
	selectedWeekdays: Weekday[] = []
	startTime: string = ""
	endTime: string = ""

	weekdayOptions: { value: Weekday; label: string }[] = [
		{ value: "MONDAY", label: "Montag" },
		{ value: "TUESDAY", label: "Dienstag" },
		{ value: "WEDNESDAY", label: "Mittwoch" },
		{ value: "THURSDAY", label: "Donnerstag" },
		{ value: "FRIDAY", label: "Freitag" },
		{ value: "SATURDAY", label: "Samstag" },
		{ value: "SUNDAY", label: "Sonntag" }
	]

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
		if (this.isSpecialMode && this.offerItems.length === 0) {
			// Für Specials: Erstelle ein Standard-Item
			this.offerItems = [
				{
					uuid: crypto.randomUUID(),
					name: "Produkte",
					maxSelections: 1,
					products: []
				}
			]
		}
		this.visible = true
	}

	showWithData(menu: any) {
		this.id = menu.id
		this.name = menu.name
		this.offerValue = menu.price
		this.takeaway = menu.takeaway || false
		this.offerType = menu.offer?.offerType || "FIXED_PRICE"
		this.discountType = menu.offer?.discountType || "PERCENTAGE"
		this.offerItems = menu.offer?.offerItems || []
		
		// Für Specials: Stelle sicher, dass ein Standard-Item existiert
		if (this.isSpecialMode && this.offerItems.length === 0) {
			this.offerItems = [
				{
					uuid: crypto.randomUUID(),
					name: "Produkte",
					maxSelections: 1,
					products: []
				}
			]
		}
		
		this.selectedWeekdays = menu.offer?.weekdays || []
		this.startTime = menu.offer?.startTime || ""
		this.endTime = menu.offer?.endTime || ""
		this.visible = true
	}

	hide() {
		this.visible = false
		this.reset()
	}

	reset() {
		this.currentTab = 0
		this.id = 0
		this.name = ""
		this.offerType = "FIXED_PRICE"
		this.offerValue = 0
		this.discountType = "PERCENTAGE"
		this.takeaway = false
		this.idError = ""
		this.nameError = ""
		this.offerValueError = ""
		this.offerItems = []
		this.newItemName = ""
		this.newItemMaxSelections = 1
		this.newItemProducts = []
		this.newItemNameError = ""
		this.expandedCategories.clear()
		this.selectedWeekdays = []
		this.startTime = ""
		this.endTime = ""
	}

	nextTab() {
		if (this.currentTab < 2) {
			this.currentTab++
		}
	}

	previousTab() {
		if (this.currentTab > 0) {
			this.currentTab--
		}
	}

	submit() {
		// Validierung
		if (!this.id || this.id <= 0) {
			this.currentTab = 0
			this.idError = this.locale.idRequired
			return
		}

		if (!this.name.trim()) {
			this.currentTab = 0
			this.nameError = this.locale.nameRequired
			return
		}

		if (this.offerValue <= 0) {
			this.currentTab = 0
			this.offerValueError = this.locale.valueRequired
			return
		}

		if (this.offerItems.length === 0) {
			this.currentTab = 1
			this.newItemNameError = this.locale.itemsRequired
			return
		}

		if (this.selectedWeekdays.length === 0) {
			this.currentTab = 2
			return
		}

		const offer = {
			id: this.id,
			uuid: crypto.randomUUID(),
			offerType: this.offerType,
			discountType: this.offerType === "DISCOUNT" ? this.discountType : undefined,
			offerValue: this.offerValue,
			weekdays: this.selectedWeekdays,
			startTime: this.startTime || undefined,
			endTime: this.endTime || undefined,
			offerItems: this.offerItems
		}

		this.primaryButtonClick.emit({
			id: this.id,
			name: this.name,
			price: this.offerValue,
			takeaway: this.takeaway,
			offer: offer
		})
	}

	// Tab 1 Methods
	idChange(value: string) {
		this.id = parseInt(value) || 0
		this.idError = ""
	}

	nameChange(value: string) {
		this.name = value
		this.nameError = ""
	}

	offerTypeChange(value: string) {
		this.offerType = value as OfferType
		this.offerValueError = ""
	}

	discountTypeChange(value: string) {
		this.discountType = value as DiscountType
	}

	offerValueChange(value: string) {
		this.offerValue = parseFloat(value) || 0
		this.offerValueError = ""
	}

	takeawayCheckboxChange(value: boolean) {
		this.takeaway = value
	}

	// Tab 2 Methods
	newItemNameChange(value: string) {
		this.newItemName = value
		this.newItemNameError = ""
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

		const newItem: OfferItem = {
			uuid: crypto.randomUUID(),
			name: this.newItemName,
			maxSelections: this.newItemMaxSelections,
			products: [...this.newItemProducts]
		}

		this.offerItems.push(newItem)

		// Reset
		this.newItemName = ""
		this.newItemMaxSelections = 1
		this.newItemProducts = []
		this.newItemNameError = ""
	}

	removeOfferItem(item: OfferItem) {
		this.offerItems = this.offerItems.filter(i => i.uuid !== item.uuid)
	}

	getProductsByCategory(): { categoryName: string; categoryUuid: string; products: Product[] }[] {
		const categoriesMap = new Map<string, { categoryName: string; categoryUuid: string; products: Product[] }>()
		
		for (const product of this.availableProducts) {
			const categoryUuid = product.category?.uuid || 'uncategorized'
			const categoryName = product.category?.name || 'Ohne Kategorie'
			
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

	// Tab 3 Methods
	selectAllWeekdays() {
		this.selectedWeekdays = [
			"MONDAY",
			"TUESDAY",
			"WEDNESDAY",
			"THURSDAY",
			"FRIDAY",
			"SATURDAY",
			"SUNDAY"
		]
	}

	toggleWeekday(weekday: Weekday) {
		const index = this.selectedWeekdays.indexOf(weekday)
		if (index === -1) {
			this.selectedWeekdays.push(weekday)
		} else {
			this.selectedWeekdays.splice(index, 1)
		}
	}

	isWeekdaySelected(weekday: Weekday): boolean {
		return this.selectedWeekdays.includes(weekday)
	}

	startTimeChange(value: string) {
		this.startTime = value
	}

	endTimeChange(value: string) {
		this.endTime = value
	}
}
