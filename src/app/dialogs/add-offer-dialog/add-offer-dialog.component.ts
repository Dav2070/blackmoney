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
import { OfferItem } from "src/app/models/OfferItem"
import { Product } from "src/app/models/Product"
import { OfferBasicData } from "./offer-basic-data/offer-basic-data.component"
import { OfferAvailability } from "./offer-availability/offer-availability.component"

@Component({
	selector: "app-add-offer-dialog",
	templateUrl: "./add-offer-dialog.component.html",
	styleUrls: ["./add-offer-dialog.component.scss"],
	standalone: false
})
export class AddOfferDialogComponent {
	locale = this.localizationService.locale.dialogs.addOfferDialog
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

	show() {
		if (this.isSpecialMode && this.offerItems.length === 0) {
			// Für Specials: Erstelle ein Standard-Item
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

			if (
				item.selectedVariations &&
				item.selectedVariations instanceof Map
			) {
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

		// Konvertiere offerValue basierend auf Typ
		let offerValueToSave: number
		if (
			this.basicData.offerType === "DISCOUNT" &&
			this.basicData.discountType === "PERCENTAGE"
		) {
			// Bei Prozent: Wert direkt speichern (z.B. 50 für 50%)
			offerValueToSave = this.basicData.offerValue
		} else {
			// Bei Betrag und Fixed Price: in Cent konvertieren
			offerValueToSave = Math.round(this.basicData.offerValue * 100)
		}

		const offer = {
			id: this.basicData.id,
			uuid: crypto.randomUUID(),
			offerType: this.basicData.offerType,
			discountType:
				this.basicData.offerType === "DISCOUNT"
					? this.basicData.discountType
					: undefined,
			offerValue: offerValueToSave,
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
			price: offerValueToSave,
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
