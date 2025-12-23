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
import { OfferBasicData } from "../add-offer-dialog/offer-basic-data/offer-basic-data.component"
import { OfferAvailability } from "../add-offer-dialog/offer-availability/offer-availability.component"

@Component({
	selector: "app-edit-offer-dialog",
	templateUrl: "./edit-offer-dialog.component.html",
	styleUrls: ["./edit-offer-dialog.component.scss"],
	standalone: false
})
export class EditOfferDialogComponent {
	locale = this.localizationService.locale.editOfferDialog
	actionsLocale = this.localizationService.locale.actions

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
	basicData: OfferBasicData = {
		id: 0,
		name: "",
		offerType: "FIXED_PRICE",
		offerValue: 0,
		discountType: "PERCENTAGE",
		takeaway: false
	}
	idError: string = ""
	nameError: string = ""
	offerValueError: string = ""

	// Tab 2: OfferItems
	offerItems: OfferItem[] = []
	newItemNameError: string = ""

	// Tab 3: Zeiten
	availabilityData: OfferAvailability = {
		selectedWeekdays: [],
		startDate: "",
		endDate: "",
		startTime: "",
		endTime: ""
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

	show(menu: any) {
		this.basicData.id = menu.id
		this.basicData.name = menu.name
		this.basicData.offerValue = menu.price
		this.basicData.takeaway = menu.takeaway || false
		this.basicData.offerType = menu.offer?.offerType || "FIXED_PRICE"
		this.basicData.discountType = menu.offer?.discountType || "PERCENTAGE"
		this.offerItems = menu.offer?.offerItems || []

		// Konvertiere selectedVariations von Object zu Map und initialisiere fehlende Variationen
		if (this.offerItems.length > 0) {
			this.offerItems.forEach(item => {
				// Konvertiere selectedVariations von Object/JSON zu Map
				if (item.selectedVariations && !(item.selectedVariations instanceof Map)) {
					const convertedMap = new Map<string, Map<string, any[]>>()
					
					// selectedVariations ist ein Object, konvertiere es zu Map
					Object.entries(item.selectedVariations).forEach(([productUuid, variationsObj]: [string, any]) => {
						const variationsMap = new Map<string, any[]>()
						
						if (variationsObj && typeof variationsObj === 'object') {
							Object.entries(variationsObj).forEach(([variationUuid, items]: [string, any]) => {
								variationsMap.set(variationUuid, Array.isArray(items) ? items : [])
							})
						}
						
						convertedMap.set(productUuid, variationsMap)
					})
					
					item.selectedVariations = convertedMap
				}
				
				if (!item.selectedVariations) {
					item.selectedVariations = new Map()
				}
				
				// Für jedes Produkt im Item: Initialisiere fehlende Variationen
				item.products.forEach(product => {
					if (product.variations && product.variations.length > 0) {
						// Nur initialisieren, wenn noch keine selectedVariations für dieses Produkt existieren
						if (!item.selectedVariations!.has(product.uuid)) {
							const variationsMap = new Map<string, any[]>()
							product.variations.forEach(variation => {
								// Initialisiere mit allen VariationItems
								variationsMap.set(variation.uuid, [
									...variation.variationItems
								])
							})
							item.selectedVariations!.set(product.uuid, variationsMap)
						}
					}
				})
			})
		}

		// Für Specials: Stelle sicher, dass ein Standard-Item existiert
		if (this.isSpecialMode && this.offerItems.length === 0) {
			this.offerItems = [
				{
					uuid: crypto.randomUUID(),
					name: "Produkte",
					maxSelections: 1,
					products: [],
					selectedVariations: new Map()
				}
			]
		}

		this.availabilityData.selectedWeekdays = menu.offer?.weekdays || []
		this.availabilityData.startDate = menu.offer?.startDate
			? new Date(menu.offer.startDate).toISOString().split("T")[0]
			: ""
		this.availabilityData.endDate = menu.offer?.endDate
			? new Date(menu.offer.endDate).toISOString().split("T")[0]
			: ""
		this.availabilityData.startTime = menu.offer?.startTime || ""
		this.availabilityData.endTime = menu.offer?.endTime || ""
		this.visible = true
	}

	hide() {
		this.visible = false
		this.reset()
	}

	reset() {
		this.currentTab = 0
		this.basicData = {
			id: 0,
			name: "",
			offerType: "FIXED_PRICE",
			offerValue: 0,
			discountType: "PERCENTAGE",
			takeaway: false
		}
		this.idError = ""
		this.nameError = ""
		this.offerValueError = ""
		this.offerItems = []
		this.newItemNameError = ""
		this.availabilityData = {
			selectedWeekdays: [],
			startDate: "",
			endDate: "",
			startTime: "",
			endTime: ""
		}
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

	// Hilfsfunktion: Konvertiere Maps zu Plain Objects für Serialisierung
	convertMapsToObjects(offerItems: OfferItem[]): any[] {
		return offerItems.map(item => {
			const itemCopy: any = {
				...item,
				products: item.products
			}

			if (item.selectedVariations && item.selectedVariations instanceof Map) {
				const selectedVariationsObj: any = {}
				
				item.selectedVariations.forEach((variationsMap, productUuid) => {
					const variationsObj: any = {}
					
					variationsMap.forEach((items, variationUuid) => {
						variationsObj[variationUuid] = items
					})
					
					selectedVariationsObj[productUuid] = variationsObj
				})
				
				itemCopy.selectedVariations = selectedVariationsObj
			} else {
				itemCopy.selectedVariations = item.selectedVariations
			}

			return itemCopy
		})
	}

	submit() {
		// Validierung
		if (!this.basicData.id || this.basicData.id <= 0) {
			this.currentTab = 0
			this.idError = this.locale.idRequired
			return
		}

		if (!this.basicData.name.trim()) {
			this.currentTab = 0
			this.nameError = this.locale.nameRequired
			return
		}

		if (this.basicData.offerValue <= 0) {
			this.currentTab = 0
			this.offerValueError = this.locale.valueRequired
			return
		}

		if (this.offerItems.length === 0) {
			this.currentTab = 1
			this.newItemNameError = this.locale.itemsRequired
			return
		}

		if (this.availabilityData.selectedWeekdays.length === 0) {
			this.currentTab = 2
			return
		}

		const offer = {
			id: this.basicData.id,
			uuid: crypto.randomUUID(),
			offerType: this.basicData.offerType,
			discountType:
				this.basicData.offerType === "DISCOUNT"
					? this.basicData.discountType
					: undefined,
			offerValue: this.basicData.offerValue,
			weekdays: this.availabilityData.selectedWeekdays,
			startDate: this.availabilityData.startDate
				? new Date(this.availabilityData.startDate)
				: undefined,
			endDate: this.availabilityData.endDate
				? new Date(this.availabilityData.endDate)
				: undefined,
			startTime: this.availabilityData.startTime || undefined,
			endTime: this.availabilityData.endTime || undefined,
			offerItems: this.convertMapsToObjects(this.offerItems)
		}

		this.primaryButtonClick.emit({
			id: this.basicData.id,
			name: this.basicData.name,
			price: this.basicData.offerValue,
			takeaway: this.basicData.takeaway,
			offer: offer
		})
	}

	onBasicDataChange(data: OfferBasicData) {
		this.basicData = data
	}

	onOfferItemsChange(items: OfferItem[]) {
		this.offerItems = items
	}

	onAvailabilityChange(data: OfferAvailability) {
		this.availabilityData = data
	}

	onErrorsClear() {
		this.clearErrors.emit()
	}
}
