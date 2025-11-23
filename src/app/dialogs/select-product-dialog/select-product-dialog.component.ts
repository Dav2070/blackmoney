import {
	Component,
	Input,
	Output,
	ViewChild,
	EventEmitter,
	ElementRef,
	Inject,
	PLATFORM_ID
} from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { Dialog } from "dav-ui-components"
import { Category } from "src/app/models/Category"
import { Product } from "src/app/models/Product"
import { Offer } from "src/app/models/Offer"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-select-product-dialog",
	templateUrl: "./select-product-dialog.component.html",
	standalone: false
})
export class SelectProductDialogComponent {
	locale = this.localizationService.locale.dialogs.selectProductDialog
	actionsLocale = this.localizationService.locale.actions
	visible: boolean = false

	@Input() menues: Product[] = []
	@Input() specials: Product[] = []
	@Input() products: Product[] = []
	@Input() categories: Category[] = []
	@Input() loading: boolean = false
	@Output() selectMenue = new EventEmitter<Product>()
	@Output() selectSpecial = new EventEmitter<Product>()
	@Output() selectProduct = new EventEmitter<Product>()
	@ViewChild("dialog") dialog: ElementRef<Dialog>

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
	}

	submitMenue(menue: Product) {
		this.selectMenue.emit(menue)
	}

	submitSpecial(special: Product) {
		this.selectSpecial.emit(special)
	}

	submitProduct(product: Product) {
		this.selectProduct.emit(product)
	}
}
