import {
	Component,
	ElementRef,
	EventEmitter,
	Inject,
	Output,
	PLATFORM_ID,
	ViewChild
} from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { Dialog } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-add-diverse-product-dialog",
	templateUrl: "./add-diverse-product-dialog.component.html",
	styleUrl: "./add-diverse-product-dialog.component.scss",
	standalone: false
})
export class AddDiverseProductDialogComponent {
	locale = this.localizationService.locale.dialogs.addDiverseProductDialog
	actionsLocale = this.localizationService.locale.actions
	@Output() primaryButtonClick = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false
	name: string = ""
	productType: string = "diverse_speisen"
	price: number = 0
	priceString: string = ""
	categoryOptions: { key: string; value: string }[]

	constructor(
		private localizationService: LocalizationService,
		@Inject(PLATFORM_ID) private platformId: object
	) {
		this.categoryOptions = [
			{
				key: "diverse_speisen",
				value: this.locale.food
			},
			{
				key: "diverse_getraenke",
				value: this.locale.drinks
			},
			{
				key: "diverse_kosten",
				value: this.locale.otherCosts
			}
		]
	}

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
		this.name = ""
		this.productType = "diverse_speisen"
		this.price = 0
		this.priceString = ""
		this.visible = true
	}

	hide() {
		this.visible = false
		this.name = ""
		this.productType = "diverse_speisen"
		this.price = 0
		this.priceString = ""
	}

	nameTextfieldChange(event: Event) {
		this.name = (event as CustomEvent).detail.value
	}

	categoryDropdownChange(event: Event) {
		this.productType = (event as CustomEvent).detail.key
	}

	priceTextfieldChange(event: Event) {
		this.priceString = (event as CustomEvent).detail.value

		// Parse the price from the input (handle comma as decimal separator)
		const cleanedPrice = this.priceString.replace(",", ".")
		const parsedPrice = parseFloat(cleanedPrice)

		if (!isNaN(parsedPrice)) {
			this.price = parsedPrice * 100
		} else {
			this.price = 0
		}
	}

	get isValid(): boolean {
		return this.name.length > 0 && this.price > 0
	}

	submit() {
		if (!this.isValid) return

		this.primaryButtonClick.emit({
			name: this.name,
			productType: this.productType,
			price: this.price
		})
		this.hide()
	}
}
