import {
	Component,
	Inject,
	PLATFORM_ID,
	ElementRef,
	ViewChild,
	Output,
	EventEmitter,
	Input
} from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { Router } from "@angular/router"
import {
	faPlus,
	faTrash,
	faTruck,
	faBagShopping,
	faUtensils
} from "@fortawesome/pro-regular-svg-icons"
import { Dialog } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"
import { Order } from "src/app/models/Order"
import { TakeawayDetails } from "src/app/models/TakeawayDetails"
import { AddTakeawayDialogComponent } from "src/app/dialogs/add-takeaway-dialog/add-takeaway-dialog.component"
import { EditTakeawayDialogComponent } from "src/app/dialogs/edit-takeaway-dialog/edit-takeaway-dialog.component"
import { PriceCalculator } from "src/app/models/cash-register/order-item-handling/price-calculator"
import { TakeawayFilterType } from "src/app/types"
import { formatPrice } from "src/app/utils"

@Component({
	selector: "app-takeaway-dialog",
	templateUrl: "./takeaway-dialog.component.html",
	styleUrl: "./takeaway-dialog.component.scss",
	standalone: false
})
export class TakeawayDialogComponent {
	locale = this.localizationService.locale.tableOverviewPage
	faPlus = faPlus
	faTrash = faTrash
	faTruck = faTruck
	faBagShopping = faBagShopping
	faUtensils = faUtensils
	takeawayFilter: TakeawayFilterType = "ALL"
	priceCalculator = new PriceCalculator()
	formatPrice = formatPrice
	visible: boolean = false
	addTakeawayDialogVisible: boolean = false
	editTakeawayDialogVisible: boolean = false
	selectedOrder: Order = null

	@ViewChild("dialog") dialog: ElementRef<Dialog>
	@Input() orders: Order[] = []
	@Output() addOrder = new EventEmitter<TakeawayDetails>()
	@Output() deleteOrderEvent = new EventEmitter<string>()
	@Output() updateOrder = new EventEmitter<TakeawayDetails>()
	@Output() navigateToOrderEvent = new EventEmitter<string>()

	@ViewChild("addTakeawayDialog")
	addTakeawayDialog: AddTakeawayDialogComponent

	@ViewChild("editTakeawayDialog")
	editTakeawayDialog: EditTakeawayDialogComponent

	get filteredOrders(): Order[] {
		if (this.takeawayFilter === "ALL") {
			return this.orders
		}
		if (this.takeawayFilter === "DELIVERY") {
			return this.orders.filter(o => o.takeawayDetails.delivery)
		}
		if (this.takeawayFilter === "PICKUP") {
			return this.orders.filter(o => o.takeawayDetails.pickUp)
		}
		if (this.takeawayFilter === "DINEIN") {
			return this.orders.filter(o => o.takeawayDetails.dineIn)
		}
		return this.orders
	}

	constructor(
		private router: Router,
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

	openAddDialog() {
		this.addTakeawayDialogVisible = true
		this.addTakeawayDialog.show()
	}

	handleAddDialogPrimaryClick(takeawayDetails: TakeawayDetails) {
		this.addTakeawayDialogVisible = false
		this.addTakeawayDialog.hide()
		this.addOrder.emit(takeawayDetails)
	}

	getOrderTotalPrice(order: Order): number {
		if (!order || !order.orderItems || order.orderItems.length === 0) {
			return 0
		}

		let total = 0
		for (const orderItem of order.orderItems) {
			total += this.priceCalculator.calculateTotalPrice(orderItem)
		}
		return total
	}

	setFilter(filter: TakeawayFilterType) {
		this.takeawayFilter = filter
	}

	deleteOrder(orderUuid: string) {
		this.deleteOrderEvent.emit(orderUuid)
	}

	handleEditDialogPrimaryClick(updatedDetails: TakeawayDetails) {
		this.editTakeawayDialogVisible = false
		this.editTakeawayDialog.hide()
		this.updateOrder.emit(updatedDetails)
	}

	openEditDialog() {
		if (this.selectedOrder) {
			this.editTakeawayDialogVisible = true
			this.editTakeawayDialog.show(this.selectedOrder.takeawayDetails)
		}
	}

	dismissAddDialog() {
		if (this.addTakeawayDialogVisible) {
			this.addTakeawayDialogVisible = false
			this.addTakeawayDialog.hide()
		}
	}

	dismissEditDialog() {
		if (this.editTakeawayDialogVisible) {
			this.editTakeawayDialogVisible = false
			this.editTakeawayDialog.hide()
		}
	}

	navigateToOrder() {
		if (this.selectedOrder) {
			this.navigateToOrderEvent.emit(this.selectedOrder.uuid)
			this.visible = false
		}
	}
}
