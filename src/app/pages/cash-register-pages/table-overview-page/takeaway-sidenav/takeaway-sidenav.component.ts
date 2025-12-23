import {
	Component,
	Inject,
	PLATFORM_ID,
	AfterViewInit,
	ElementRef,
	ViewChild,
	Output,
	EventEmitter,
	Input
} from "@angular/core"
import { isPlatformServer } from "@angular/common"
import { Router } from "@angular/router"
import {
	faPlus,
	faTrash,
	faTruck,
	faBagShopping,
	faUtensils,
	faArrowLeft
} from "@fortawesome/pro-regular-svg-icons"
import { LocalizationService } from "src/app/services/localization-service"
import { Order } from "src/app/models/Order"
import { TakeawayDetails } from "src/app/models/TakeawayDetails"
import { AddTakeawayDialogComponent } from "src/app/dialogs/add-takeaway-dialog/add-takeaway-dialog.component"
import { ViewTakeawayDialogComponent } from "src/app/dialogs/view-takeaway-dialog/view-takeaway-dialog.component"
import { EditTakeawayDialogComponent } from "src/app/dialogs/edit-takeaway-dialog/edit-takeaway-dialog.component"
import { PriceCalculator } from "src/app/models/cash-register/order-item-handling/price-calculator"
import { TakeawayFilterType } from "src/app/types"

@Component({
	selector: "app-takeaway-sidenav",
	templateUrl: "./takeaway-sidenav.component.html",
	styleUrl: "./takeaway-sidenav.component.scss",
	standalone: false
})
export class TakeawaySidenavComponent implements AfterViewInit {
	locale = this.localizationService.locale.tableOverviewPage
	faPlus = faPlus
	faTrash = faTrash
	faTruck = faTruck
	faBagShopping = faBagShopping
	faUtensils = faUtensils
	faArrowLeft = faArrowLeft
	takeawayFilter: TakeawayFilterType = "all"
	priceCalculator = new PriceCalculator()

	@Input() orders: Order[] = []
	@Output() addOrder = new EventEmitter<TakeawayDetails>()
	@Output() deleteOrderEvent = new EventEmitter<string>()
	@Output() updateOrder = new EventEmitter<TakeawayDetails>()

	get filteredOrders(): Order[] {
		if (this.takeawayFilter === "all") {
			return this.orders
		}
		if (this.takeawayFilter === "delivery") {
			return this.orders.filter(o => o.takeawayDetails.delivery)
		}
		if (this.takeawayFilter === "pickUp") {
			return this.orders.filter(o => o.takeawayDetails.pickUp)
		}
		if (this.takeawayFilter === "dineIn") {
			return this.orders.filter(o => o.takeawayDetails.dineIn)
		}
		return this.orders
	}

	@ViewChild("takeawaySidenav")
	takeawaySidenav: ElementRef<any>

	@ViewChild("addTakeawayDialog")
	addTakeawayDialog: AddTakeawayDialogComponent

	@ViewChild("viewTakeawayDialog")
	viewTakeawayDialog: ViewTakeawayDialogComponent

	@ViewChild("editTakeawayDialog")
	editTakeawayDialog: EditTakeawayDialogComponent

	constructor(
		private router: Router,
		private localizationService: LocalizationService,
		@Inject(PLATFORM_ID) private platformId: object
	) {}

	ngAfterViewInit() {
		if (isPlatformServer(this.platformId)) return

		if (this.takeawaySidenav) {
			const sidenav = this.takeawaySidenav.nativeElement

			sidenav.addEventListener("dismiss", () => {
				sidenav.open = false
			})
		}
	}

	open() {
		if (this.takeawaySidenav) {
			this.takeawaySidenav.nativeElement.open = true
		}
	}

	closeSidenav() {
		if (this.takeawaySidenav) {
			this.takeawaySidenav.nativeElement.open = false
		}
	}

	openAddDialog() {
		this.addTakeawayDialog.show()
	}

	handleAddDialogPrimaryClick(takeawayDetails: TakeawayDetails) {
		this.addOrder.emit(takeawayDetails)
	}

	getOrderTotalPrice(order: Order): number {
		if (!order.orderItems || order.orderItems.length === 0) {
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

	openViewDialog(order: Order) {
		this.viewTakeawayDialog.show(order.takeawayDetails)
	}

	handleViewDialogEditClick(takeawayDetails: TakeawayDetails) {
		this.editTakeawayDialog.show(takeawayDetails)
	}

	handleEditDialogPrimaryClick(updatedDetails: TakeawayDetails) {
		this.updateOrder.emit(updatedDetails)
	}

	navigateToOrder(orderUuid: string) {
		this.router.navigate(["dashboard", "tables", orderUuid])
	}
}
