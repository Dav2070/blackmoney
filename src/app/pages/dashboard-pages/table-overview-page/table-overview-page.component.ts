import {
	Component,
	Inject,
	PLATFORM_ID,
	ElementRef,
	ViewChild
} from "@angular/core"
import { isPlatformServer } from "@angular/common"
import { Router } from "@angular/router"
import { faCupTogo } from "@fortawesome/pro-regular-svg-icons"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { Room } from "src/app/models/Room"
import { Order } from "src/app/models/Order"
import { TakeawayDetails } from "src/app/models/TakeawayDetails"
import { TakeawayDialogComponent } from "src/app/dialogs/takeaway-dialog/takeaway-dialog.component"
import { OrderItem } from "src/app/models/OrderItem"
import { Product } from "src/app/models/Product"
import { OrderItemType } from "src/app/types"

@Component({
	templateUrl: "./table-overview-page.component.html",
	styleUrl: "./table-overview-page.component.scss",
	standalone: false
})
export class TableOverviewPageComponent {
	locale = this.localizationService.locale.tableOverviewPage
	faCupTogo = faCupTogo
	rooms: Room[] = []
	selectedRoom: Room = null
	roomsLoading: boolean = true
	takeawayOrders: Order[] = []

	@ViewChild("takeawayDialog")
	takeawayDialog: TakeawayDialogComponent

	constructor(
		private router: Router,
		private dataService: DataService,
		private localizationService: LocalizationService,
		private elementRef: ElementRef,
		@Inject(PLATFORM_ID) private platformId: object
	) {
		// Beispiel-Bestellungen
		this.createExampleOrders()
	}

	createExampleOrders() {
		// Beispiel 1: Lieferung mit OrderItems
		const order1 = new Order()
		order1.uuid = crypto.randomUUID()
		order1.totalPrice = 0
		order1.takeawayDetails = {
			uuid: crypto.randomUUID(),
			name: "Max Mustermann",
			phoneNumber: "0123 456789",
			line1: "Musterstraße",
			line2: "",
			houseNumber: "42",
			postalCode: "12345",
			city: "Musterstadt",
			delivery: true,
			pickUp: false,
			dineIn: false
		}

		// Pizza Margherita
		const product1 = new Product()
		product1.uuid = crypto.randomUUID()
		product1.name = "Pizza Margherita"
		product1.price = 850
		product1.variations = []

		const orderItem1: OrderItem = {
			uuid: crypto.randomUUID(),
			type: OrderItemType.Product,
			count: 2,
			order: order1,
			product: product1,
			orderItems: [],
			orderItemVariations: []
		}

		// Coca Cola
		const product2 = new Product()
		product2.uuid = crypto.randomUUID()
		product2.name = "Coca Cola 0.5l"
		product2.price = 350
		product2.variations = []

		const orderItem2: OrderItem = {
			uuid: crypto.randomUUID(),
			type: OrderItemType.Product,
			count: 1,
			order: order1,
			product: product2,
			orderItems: [],
			orderItemVariations: []
		}

		order1.orderItems = [orderItem1, orderItem2]
		this.takeawayOrders.push(order1)

		// Beispiel 2: Abholung mit OrderItems
		const order2 = new Order()
		order2.uuid = crypto.randomUUID()
		order2.totalPrice = 0
		order2.takeawayDetails = {
			uuid: crypto.randomUUID(),
			name: "Anna Schmidt",
			phoneNumber: "0987 654321",
			line1: "",
			line2: "",
			houseNumber: "",
			postalCode: "",
			city: "",
			delivery: false,
			pickUp: true,
			dineIn: false
		}

		// Burger
		const product3 = new Product()
		product3.uuid = crypto.randomUUID()
		product3.name = "Cheeseburger"
		product3.price = 1290
		product3.variations = []

		const orderItem3: OrderItem = {
			uuid: crypto.randomUUID(),
			type: OrderItemType.Product,
			count: 3,
			order: order2,
			product: product3,
			orderItems: [],
			orderItemVariations: []
		}

		order2.orderItems = [orderItem3]
		this.takeawayOrders.push(order2)

		// Beispiel 3: Vor Ort ohne Items
		const order3 = new Order()
		order3.uuid = crypto.randomUUID()
		order3.orderItems = []
		order3.totalPrice = 0
		order3.takeawayDetails = {
			uuid: crypto.randomUUID(),
			name: "Peter Müller",
			phoneNumber: "0176 12345678",
			line1: "",
			line2: "",
			houseNumber: "",
			postalCode: "",
			city: "",
			delivery: false,
			pickUp: false,
			dineIn: true
		}
		this.takeawayOrders.push(order3)

		// Beispiel 4: Lieferung mit mehr Items
		const order4 = new Order()
		order4.uuid = crypto.randomUUID()
		order4.totalPrice = 0
		order4.takeawayDetails = {
			uuid: crypto.randomUUID(),
			name: "Sarah Meier",
			phoneNumber: "030 98765432",
			line1: "Berliner Allee",
			line2: "Hinterhaus",
			houseNumber: "15",
			postalCode: "10115",
			city: "Berlin",
			delivery: true,
			pickUp: false,
			dineIn: false
		}

		// Pasta Carbonara
		const product4 = new Product()
		product4.uuid = crypto.randomUUID()
		product4.name = "Pasta Carbonara"
		product4.price = 1150
		product4.variations = []

		const orderItem4: OrderItem = {
			uuid: crypto.randomUUID(),
			type: OrderItemType.Product,
			count: 1,
			order: order4,
			product: product4,
			orderItems: [],
			orderItemVariations: []
		}

		// Tiramisu
		const product5 = new Product()
		product5.uuid = crypto.randomUUID()
		product5.name = "Tiramisu"
		product5.price = 590
		product5.variations = []

		const orderItem5: OrderItem = {
			uuid: crypto.randomUUID(),
			type: OrderItemType.Product,
			count: 2,
			order: order4,
			product: product5,
			orderItems: [],
			orderItemVariations: []
		}

		// Wasser
		const product6 = new Product()
		product6.uuid = crypto.randomUUID()
		product6.name = "Mineralwasser 1l"
		product6.price = 250
		product6.variations = []

		const orderItem6: OrderItem = {
			uuid: crypto.randomUUID(),
			type: OrderItemType.Product,
			count: 1,
			order: order4,
			product: product6,
			orderItems: [],
			orderItemVariations: []
		}

		order4.orderItems = [orderItem4, orderItem5, orderItem6]
		this.takeawayOrders.push(order4)

		// Beispiel 5: Abholung
		const order5 = new Order()
		order5.uuid = crypto.randomUUID()
		order5.totalPrice = 0
		order5.takeawayDetails = {
			uuid: crypto.randomUUID(),
			name: "Klaus Wagner",
			phoneNumber: "089 87654321",
			line1: "",
			line2: "",
			houseNumber: "",
			postalCode: "",
			city: "",
			delivery: false,
			pickUp: true,
			dineIn: false
		}

		// Schnitzel
		const product7 = new Product()
		product7.uuid = crypto.randomUUID()
		product7.name = "Wiener Schnitzel"
		product7.price = 1590
		product7.variations = []

		const orderItem7: OrderItem = {
			uuid: crypto.randomUUID(),
			type: OrderItemType.Product,
			count: 1,
			order: order5,
			product: product7,
			orderItems: [],
			orderItemVariations: []
		}

		// Pommes
		const product8 = new Product()
		product8.uuid = crypto.randomUUID()
		product8.name = "Pommes Frites"
		product8.price = 390
		product8.variations = []

		const orderItem8: OrderItem = {
			uuid: crypto.randomUUID(),
			type: OrderItemType.Product,
			count: 2,
			order: order5,
			product: product8,
			orderItems: [],
			orderItemVariations: []
		}

		order5.orderItems = [orderItem7, orderItem8]
		this.takeawayOrders.push(order5)
	}

	async ngOnInit() {
		if (isPlatformServer(this.platformId)) return

		await this.dataService.davUserPromiseHolder.AwaitResult()
		await this.dataService.companyPromiseHolder.AwaitResult()
		await this.dataService.restaurantPromiseHolder.AwaitResult()

		if (!this.dataService.dav.isLoggedIn) {
			this.router.navigate([""])
			return
		}

		// Check if the user still needs to do the onboarding
		if (this.dataService.company == null) {
			this.router.navigate(["onboarding"])
			return
		}

		this.roomsLoading = false

		for (let room of this.dataService.restaurant.rooms) {
			this.rooms.push(room)
		}

		if (this.rooms.length > 0) {
			this.selectedRoom = this.rooms[0]
		}
	}

	navigateToUserPage() {
		this.router.navigate(["dashboard"])
	}

	navigateToTablePage(event: MouseEvent, tableUuid: string) {
		event.preventDefault()
		this.router.navigate(["dashboard", "tables", tableUuid])
	}

	toggleTakeawayDialog() {
		if (this.takeawayDialog) {
			this.takeawayDialog.show()
		}
	}

	handleNavigateToOrder(orderUuid: string) {
		this.router.navigate(["dashboard", "tables", orderUuid])
	}

	handleAddTakeawayOrder(takeawayDetails: TakeawayDetails) {
		const order = new Order()
		order.uuid = crypto.randomUUID()
		order.takeawayDetails = takeawayDetails
		order.orderItems = []
		order.totalPrice = 0

		this.takeawayOrders.push(order)

		// Navigate to booking page
		this.router.navigate(["dashboard", "tables", order.uuid])
	}

	handleDeleteTakeawayOrder(orderUuid: string) {
		this.takeawayOrders = this.takeawayOrders.filter(
			order => order.uuid !== orderUuid
		)
	}

	handleUpdateTakeawayOrder(updatedDetails: TakeawayDetails) {
		const order = this.takeawayOrders.find(
			o => o.takeawayDetails.uuid === updatedDetails.uuid
		)
		if (order) {
			order.takeawayDetails = updatedDetails
		}
	}
}
