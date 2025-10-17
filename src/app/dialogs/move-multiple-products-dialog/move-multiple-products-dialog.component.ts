import {
	Component,
	ViewChild,
	ElementRef,
	Inject,
	PLATFORM_ID,
	Input,
	Output,
	EventEmitter
} from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { faPlus, faMinus } from "@fortawesome/pro-regular-svg-icons"
import { Dialog } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"
import { OrderItem } from "src/app/models/OrderItem"

@Component({
	selector: "app-move-multiple-products-dialog",
	templateUrl: "./move-multiple-products-dialog.component.html",
	styleUrl: "./move-multiple-products-dialog.component.scss",
	standalone: false
})
export class MoveMultipleProductsDialogComponent {
	locale = this.localizationService.locale.dialogs.moveMultipleProductsDialog
	actionsLocale = this.localizationService.locale.actions
	faPlus = faPlus
	faMinus = faMinus
	visible: boolean = false
	count: number = 1
	@Input() orderItem: OrderItem = null
	@Output() primaryButtonClick = new EventEmitter<{ count: number }>()
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
		this.count = this.orderItem?.count || 1
		this.visible = true
	}

	hide() {
		this.visible = false
	}

	countTextfieldChange(event: Event) {
		this.count = Number((event as CustomEvent).detail.value)
	}

	decreaseCount() {
		this.count--
	}

	increaseCount() {
		this.count++
	}

	submit() {
		this.primaryButtonClick.emit({ count: this.count })
	}
}
