import {
	Component,
	Input,
	Output,
	EventEmitter,
	ViewChild,
	ElementRef,
	Inject,
	PLATFORM_ID
} from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import {
	faMoneyBill1Wave,
	faCreditCard
} from "@fortawesome/pro-regular-svg-icons"
import { Dialog } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"
import { Order } from "src/app/models/Order"
import {
	calculateTotalPriceOfOrder,
	calculateTotalPriceOfOrderItem,
	formatPrice
} from "src/app/utils"

@Component({
	selector: "app-bills-overview-dialog",
	templateUrl: "./bills-overview-dialog.component.html",
	styleUrl: "./bills-overview-dialog.component.scss",
	standalone: false
})
export class BillsOverviewDialogComponent {
	actionsLocale = this.localizationService.locale.actions
	calculateTotalPriceOfOrder = calculateTotalPriceOfOrder
	calculateTotalPriceOfOrderItem = calculateTotalPriceOfOrderItem
	formatPrice = formatPrice
	faMoneyBill1Wave = faMoneyBill1Wave
	faCreditCard = faCreditCard
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	@Input() orders: Order[] = []
	visible: boolean = false
	selectedOrder: Order = null

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

		setTimeout(() => {
			if (this.orders.length > 0) {
				this.selectedOrder = this.orders[0]
			}
		}, 200)
	}

	hide() {
		this.visible = false
	}
}
