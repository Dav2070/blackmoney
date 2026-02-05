import { Component, HostListener, ViewChild, ElementRef } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import {
	faPlus,
	faMinus,
	faChevronsRight,
	faChevronsLeft,
	faCreditCard,
	faMoneyBill1Wave
} from "@fortawesome/pro-regular-svg-icons"
import { ContextMenu } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { MessageService } from "src/app/services/message-service"
import { MoveMultipleProductsDialogComponent } from "src/app/dialogs/move-multiple-products-dialog/move-multiple-products-dialog.component"
import { ProductVariationsCombinationsDialogComponent } from "src/app/dialogs/product-variations-combinations-dialog/product-variations-combinations-dialog.component"
import { ActivateRegisterDialogComponent } from "src/app/dialogs/activate-register-dialog/activate-register-dialog.component"
import { AllItemHandler } from "src/app/models/cash-register/order-item-handling/all-item-handler.model"
import { OrderItem } from "src/app/models/OrderItem"
import { Table } from "src/app/models/Table"
import {
	calculateTotalPriceOfOrderItem,
	formatPrice,
	getGraphQLErrorCodes,
	showToast
} from "src/app/utils"
import { AddOrderItemVariationInput, PaymentMethod } from "src/app/types"

@Component({
	templateUrl: "./payment-page.component.html",
	styleUrl: "./payment-page.component.scss",
	standalone: false
})
export class PaymentPageComponent {
	locale = this.localizationService.locale.paymentPage
	faPlus = faPlus
	faMinus = faMinus
	faChevronsRight = faChevronsRight
	faChevronsLeft = faChevronsLeft
	faCreditCard = faCreditCard
	faMoneyBill1Wave = faMoneyBill1Wave
	bookedItems = new AllItemHandler()
	bills: AllItemHandler[] = [new AllItemHandler()]
	table: Table = null
	ordersLoading: boolean = true

	orderUuid: string = ""
	billUuid: string = ""
	activeBill: AllItemHandler = this.bills[0]

	lastClickedItem: OrderItem
	tmpVariations: OrderItem
	tmpAnzahl: number

	tmpSend: AllItemHandler
	tmpReceiver: AllItemHandler

	calculateTotalPriceOfOrderItem = calculateTotalPriceOfOrderItem

	//#region MoveMultiplProductsDialog variations
	@ViewChild("moveMultipleProductsDialog")
	moveMultipleProductsDialog: MoveMultipleProductsDialogComponent
	//#endregion

	//#region ProductVariationsDialog variables
	@ViewChild("productVariationsCombinationsDialog")
	productVariationsCombinationsDialog: ProductVariationsCombinationsDialogComponent
	//#endregion

	//#region ActivateRegisterDialog
	@ViewChild("activateRegisterDialog")
	activateRegisterDialog: ActivateRegisterDialogComponent
	activateRegisterDialogLoading: boolean = false
	//#endregion

	//#region ContextMenu variables
	@ViewChild("contextMenu")
	contextMenu: ElementRef<ContextMenu>
	contextMenuOrderItem: OrderItem = null
	contextMenuVisible: boolean = false
	contextMenuPositionX: number = 0
	contextMenuPositionY: number = 0
	contextMenuBillsList: boolean = false
	//#endregion

	constructor(
		private activatedRoute: ActivatedRoute,
		private localizationService: LocalizationService,
		private apiService: ApiService,
		private dataService: DataService,
		private messageService: MessageService,
		private router: Router
	) {}

	async ngOnInit() {
		await this.dataService.restaurantPromiseHolder.AwaitResult()

		const uuid = this.activatedRoute.snapshot.paramMap.get("uuid")

		for (let room of this.dataService.restaurant.rooms) {
			this.table = room.tables.find(table => table.uuid === uuid)
			if (this.table) break
		}

		const order = await this.bookedItems.loadItemsFromOrder(
			this.apiService,
			this.table.uuid
		)

		this.orderUuid = order.uuid
		this.billUuid = order.bill?.uuid
		this.ordersLoading = false
	}

	@HostListener("document:click", ["$event"])
	documentClick(event: MouseEvent) {
		if (!this.contextMenu.nativeElement.contains(event.target as Node)) {
			this.contextMenuVisible = false
		}
	}

	navigateToBookingPage(event: MouseEvent) {
		event.preventDefault()
		this.router.navigate(["dashboard", "tables", this.table.uuid])
	}

	async showContextMenu(
		event: MouseEvent,
		orderItem: OrderItem,
		billsList: boolean
	) {
		event.preventDefault()

		if (orderItem.count <= 1 || orderItem.orderItemVariations.length > 0) {
			return
		}

		this.contextMenuOrderItem = orderItem

		// Set the position of the context menu
		this.contextMenuPositionX = event.pageX
		this.contextMenuPositionY = event.pageY

		if (this.contextMenuVisible) {
			this.contextMenuVisible = false

			await new Promise((resolve: Function) => {
				setTimeout(() => resolve(), 60)
			})
		}

		this.contextMenuBillsList = billsList
		this.contextMenuVisible = true
	}

	showMoveMultipleProductsDialog() {
		this.contextMenuVisible = false
		this.moveMultipleProductsDialog.show()
	}

	//Berechnet den Preis aller Items eines Tisches
	showTotal(bookedItems: AllItemHandler) {
		return formatPrice(bookedItems.calculateTotal())
	}

	addBill() {
		this.bills.push(new AllItemHandler())
		this.activeBill = this.bills[this.bills.length - 1]
	}

	calculateTotalBills() {
		let tmpTotal = 0

		for (const bill of this.bills) {
			tmpTotal += bill.calculateTotal()
		}

		return formatPrice(tmpTotal)
	}

	setActiveBill(bill: AllItemHandler) {
		this.activeBill = bill
	}

	removeBill() {
		this.bookedItems.transferAllItems(this.activeBill)
		let index = this.bills.indexOf(this.activeBill)

		this.bills.splice(index, 1)

		//Setze die nächste aktive Rechnung
		if (this.bills.length > 0) {
			if (index === this.bills.length) {
				this.activeBill = this.bills[index - 1]
			} else {
				this.activeBill = this.bills[index]
			}
		}
	}

	checkMaxBills() {
		if (this.bookedItems.getNumberOfItems() == 1 && this.bills.length == 1) {
			return false
		}
		if (this.bookedItems.getNumberOfItems() <= this.bills.length) {
			return true
		}

		return false
	}

	transferItem(
		item: OrderItem,
		send: AllItemHandler,
		receiving: AllItemHandler
	) {
		let anzahl = 1
		if (this.tmpAnzahl > 0) {
			anzahl = this.tmpAnzahl
		}
		if (item.count < anzahl) {
			window.alert(
				"Es können maximal " + item.count + " Items übertragen werden"
			)
		} else {
			if (item.orderItemVariations.length == 0) {
				send.reduceItem(item, anzahl)
				receiving.pushNewItem({ ...item, count: anzahl })
			}

			if (item.orderItemVariations.length == 1) {
				this.tmpSend = send
				this.tmpReceiver = receiving
				this.lastClickedItem = item
				this.tmpVariations = JSON.parse(JSON.stringify(item))

				this.tmpVariations.count = anzahl
				for (let variation of this.tmpVariations.orderItemVariations) {
					variation.count = anzahl
				}
				this.transferVariation()
			}

			if (item.orderItemVariations.length > 1) {
				this.tmpSend = send
				this.tmpReceiver = receiving
				this.lastClickedItem = item
				this.tmpVariations = JSON.parse(JSON.stringify(item))
				this.tmpVariations.count = 0

				for (const variation of this.tmpVariations.orderItemVariations) {
					variation.count = 0
				}

				this.productVariationsCombinationsDialog.show()
			}
		}
	}

	transferVariation() {
		this.tmpVariations.orderItemVariations =
			this.tmpVariations.orderItemVariations.filter(v => v.count > 0)
		this.tmpReceiver.pushNewItem(this.tmpVariations)
		this.tmpSend.reduceItem(this.lastClickedItem, this.tmpVariations.count)

		for (
			let i = this.lastClickedItem.orderItemVariations.length - 1;
			i >= 0;
			i--
		) {
			const variation = this.lastClickedItem.orderItemVariations[i]
			const matchingVariation = this.tmpVariations.orderItemVariations.find(
				v =>
					v.variationItems.length === variation.variationItems.length &&
					v.variationItems.every(
						(item, index) =>
							item.id === variation.variationItems[index].id
					)
			)

			if (matchingVariation) {
				variation.count -= matchingVariation.count

				// Entfernen, wenn der count kleiner oder gleich 0 ist
				if (variation.count <= 0) {
					this.lastClickedItem.orderItemVariations.splice(i, 1)
				}
			}
		}
	}

	async createBill(paymentMethod: PaymentMethod) {
		await this.dataService.registerClientPromiseHolder.AwaitResult()

		// Check if the register is activated
		if (this.dataService.register.status === "INACTIVE") {
			this.activateRegisterDialog.show()
			return
		}

		// Update the current order with the remaining items
		// TODO: Error handling
		// TODO: Check if there are any remaining items, if not use the order for all items
		await this.apiService.updateOrder("uuid", {
			uuid: this.orderUuid,
			orderItems: this.bookedItems.getItemsCountandId()
		})

		const newOrder = await this.apiService.createOrder("uuid", {
			tableUuid: this.table.uuid
		})

		await this.apiService.addProductsToOrder("uuid", {
			uuid: newOrder.data.createOrder.uuid,
			products: this.activeBill.getAllPickedItems().map(item => {
				let variations: AddOrderItemVariationInput[] = []

				if (item.orderItemVariations.length > 0) {
					variations = item.orderItemVariations.map(variation => ({
						uuid: variation.uuid,
						variationItemUuids: variation.variationItems.map(v => v.uuid),
						count: variation.count
					}))
				}

				return {
					uuid: item.product.uuid,
					count: item.count,
					variations
				}
			})
		})

		if (this.billUuid == null) {
			// Create a bill
			const createBillResponse = await this.apiService.createBill(`uuid`, {
				registerClientUuid: this.dataService.registerClient.uuid
			})

			const createBillResponseData = createBillResponse.data.createBill
			this.billUuid = createBillResponseData.uuid
		}

		if (paymentMethod === "CARD") {
			this.messageService.postMessage({
				type: "startPayment",
				price: this.activeBill.calculateTotal()
			})
		} else {
			await this.apiService.completeOrder("uuid", {
				uuid: newOrder.data.createOrder.uuid,
				billUuid: this.billUuid,
				paymentMethod
			})
		}

		this.removeBill()
	}

	moveMultipleProductsDialogPrimaryButtonClick(event: { count: number }) {
		this.moveMultipleProductsDialog.hide()
		this.tmpAnzahl = event.count
		this.transferItem(
			this.contextMenuOrderItem,
			this.contextMenuBillsList ? this.bookedItems : this.activeBill,
			this.contextMenuBillsList ? this.activeBill : this.bookedItems
		)
		this.tmpAnzahl = 1
	}

	productVariationsCombinationsDialogPrimaryButtonClick(event: {
		variationCombinations: { [key: string]: number }
	}) {
		this.productVariationsCombinationsDialog.hide()

		// Go through each variation combination and update the orderItemVariations in lastClickedItem accordingly
		for (const key of Object.keys(event.variationCombinations)) {
			const count = event.variationCombinations[key]
			if (count === 0) continue

			// Find the matching OrderItemVariation
			const matchingVariation =
				this.lastClickedItem.orderItemVariations.find(
					oiv =>
						oiv.variationItems.length === key.split(",").length &&
						oiv.variationItems.every(vi => key.includes(vi.uuid))
				)

			if (matchingVariation) {
				this.tmpSend.reduceItem(this.lastClickedItem, count)
				matchingVariation.count -= count

				// Entfernen, wenn der count kleiner oder gleich 0 ist
				if (matchingVariation.count <= 0) {
					this.lastClickedItem.orderItemVariations =
						this.lastClickedItem.orderItemVariations.filter(
							ov => ov !== matchingVariation
						)
				}

				this.tmpReceiver.pushNewItem({
					...this.lastClickedItem,
					count: count,
					orderItemVariations: [
						{
							...matchingVariation,
							count: count
						}
					]
				})
			}
		}
	}

	async activateRegisterDialogPrimaryButtonClick() {
		this.activateRegisterDialogLoading = true

		const activateRegisterResponse = await this.apiService.activateRegister(
			`status`,
			{ uuid: this.dataService.register.uuid }
		)

		this.activateRegisterDialogLoading = false

		if (activateRegisterResponse.data?.activateRegister != null) {
			this.dataService.register.status =
				activateRegisterResponse.data.activateRegister.status
			showToast(this.locale.activationSuccess)
		} else {
			let errors = getGraphQLErrorCodes(activateRegisterResponse)
			if (errors == null) return

			if (errors.includes("REGISTER_ALREADY_ACTIVE")) {
				this.dataService.register.status = "ACTIVE"
			} else {
				showToast(this.locale.activationError)
			}
		}

		this.activateRegisterDialog.hide()
	}
}
