import {
	Component,
	Input,
	Output,
	EventEmitter,
	ElementRef,
	ViewChild,
	Inject,
	PLATFORM_ID
} from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { faPlus, faMinus } from "@fortawesome/pro-regular-svg-icons"
import { Dialog } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"
import { Product } from "src/app/models/Product"

@Component({
	selector: "app-select-product-variation-dialog",
	templateUrl: "./select-product-variation-dialog.component.html",
	styleUrl: "./select-product-variation-dialog.component.scss",
	standalone: false
})
export class SelectProductVariationDialogComponent {
	faPlus = faPlus
	faMinus = faMinus
	actionsLocale = this.localizationService.locale.actions

	visible: boolean = false
	currentVariation: number = 0
	selectedVariations: {
		[key: string]: number
	} = {}

	@Input() product: Product = null
	@Output() primaryButtonClick = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>

	constructor(
		private localizationService: LocalizationService,
		@Inject(PLATFORM_ID) private platformId: object
	) { }
	
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

	addButtonClick(uuid: string) {
		if (this.selectedVariations[uuid] == null) {
			this.selectedVariations[uuid] = 1
		} else {
			this.selectedVariations[uuid]++
		}
	}

	removeButtonClick(uuid: string) {
		if (this.selectedVariations[uuid] == null) {
			this.selectedVariations[uuid] = 0
		} else if (this.selectedVariations[uuid] > 0) {
			this.selectedVariations[uuid]--
		}
	}

	submit() {
		this.primaryButtonClick.emit()
	}
}
