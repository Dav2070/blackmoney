import { Apollo } from "apollo-angular"
import * as ErrorCodes from "./errorCodes"

export interface List<T> {
	total: number
	items: T[]
}

export enum Theme {
	System = "system",
	Light = "light",
	Dark = "dark"
}

export type ApolloResult<T> = Apollo.MutateResult<T> & {
	error?: { errors?: { extensions?: { code?: string; errors?: string[] } }[] }
}

export type SendMessage =
	| {
			type: "startPayment"
			price: number
	  }
	| {
			type: "createStripeConnectionToken"
			secret: string
	  }

export type ReceiveMessage =
	| {
			type: "createStripeConnectionToken"
	  }
	| {
			type: "captureStripePaymentIntent"
			id: string
	  }

export interface SessionResource {
	uuid: string
	user: UserResource
}

export interface CompanyResource {
	uuid: string
	name: string
	restaurants: List<RestaurantResource>
	users: List<UserResource>
}

export interface RestaurantResource {
	uuid: string
	name: string
	owner?: string
	taxNumber?: string
	mail?: string
	phoneNumber?: string
	city: string
	country: Country
	line1: string
	line2: string
	postalCode: string
	menu: MenuResource
	users: List<UserResource>
	rooms: List<RoomResource>
	registers: List<RegisterResource>
	printers: List<PrinterResource>
	address: AddressResource
}

export interface AddressResource {
	uuid: string
	city?: string
	country?: Country
	line1?: string
	line2?: string
	houseNumber?: string
	postalCode?: string
}

export interface RegisterResource {
	uuid: string
	name: string
	status: RegisterStatus
	registerClients: List<RegisterClientResource>
}

export interface RegisterClientResource {
	uuid: string
	name: string
	serialNumber: string
	register: RegisterResource
	printRules: List<PrintRuleResource>
}

export interface UserResource {
	uuid: string
	name: string
	role: UserRole
	company: CompanyResource
}

export interface RoomResource {
	uuid: string
	name: string
	tables: List<TableResource>
}

export interface TableResource {
	uuid: string
	name: number
	seats: number
	orders: List<OrderResource>
}

export interface PrinterResource {
	uuid: string
	name: string
	ipAddress: string
}

export interface PrintRuleResource {
	uuid: string
	type: PrintRuleType
	productType?: ProductType
	printers: List<PrinterResource>
	categories: List<CategoryResource>
	products: List<ProductResource>
}

export interface MenuResource {
	uuid: string
	categories: List<CategoryResource>
	variations: List<VariationResource>
	offers: List<OfferResource>
}

export interface OfferResource {
	id: number
	uuid: string
	offerType: OfferType
	discountType?: DiscountType
	offerValue: number
	startDate?: string
	endDate?: string
	startTime?: string
	endTime?: string
	weekdays: Weekday[]
	product?: ProductResource
	offerItems: List<OfferItemResource>
}

export interface OfferItemResource {
	uuid: string
	name: string
	maxSelections: number
	products: List<ProductResource>
}

export interface ProductResource {
	uuid: string
	type: ProductType
	name: string
	price: number
	shortcut: number
	category: CategoryResource
	offer?: OfferResource
	variations: List<VariationResource>
}

export interface VariationResource {
	id: number
	uuid: string
	name: string
	variationItems: List<VariationItemResource>
}

export interface VariationItemResource {
	id: number
	uuid: string
	name: string
	additionalCost: number
}

export interface CategoryResource {
	uuid: string
	name: string
	products: List<ProductResource>
}

export interface BillResource {
	uuid: string
}

export interface OrderResource {
	uuid: string
	totalPrice: number
	paymentMethod: PaymentMethod
	paidAt: string
	bill: BillResource
	table: TableResource
	orderItems: List<OrderItemResource>
}

export interface OrderItemResource {
	uuid: string
	count: number
	type: OrderItemType
	discount: number
	diversePrice?: number
	notes?: string
	takeAway: boolean
	course?: number
	order: OrderResource
	product: ProductResource
	offer?: OfferResource
	orderItems: List<OrderItemResource>
	orderItemVariations: List<OrderItemVariationResource>
}

export interface OrderItemVariationResource {
	uuid: string
	count: number
	variationItems: List<VariationItemResource>
}

export interface ReservationResource {
	uuid: string
	table: TableResource
	name: string
	phoneNumber?: string
	email?: string
	numberOfPeople: number
	date: string
	checkedIn: boolean
}

export interface AddOrderItemInput {
	uuid?: string
	productUuid?: string
	count: number
	discount?: number
	diversePrice?: number
	type?: OrderItemType
	notes?: string
	takeAway?: boolean
	course?: number
	offerUuid?: string
	variations?: AddOrderItemVariationInput[]
	orderItems?: AddChildOrderItemInput[]
}

export interface AddOrderItemVariationInput {
	uuid?: string
	variationItemUuids: string[]
	count: number
}

export interface AddChildOrderItemInput {
	uuid?: string
	productUuid: string
	count: number
	variations?: AddOrderItemVariationInput[]
}

export type UserRole = "OWNER" | "ADMIN" | "USER"
export type ProductType = "FOOD" | "DRINK" | "SPECIAL" | "MENU"
export type PrintRuleType = "BILLS" | "PRODUCT_TYPE" | "CATEGORIES" | "PRODUCTS"
export type OrderType = "DELIVERY" | "PICKUP"

export enum OrderItemType {
	Product = "PRODUCT",
	Menu = "MENU",
	Special = "SPECIAL",
	DiverseFood = "DIVERSE_FOOD",
	DiverseDrink = "DIVERSE_DRINK",
	DiverseOther = "DIVERSE_OTHER"
}

export type TakeawayFilterType = "ALL" | "DELIVERY" | "PICKUP" | "DINEIN"
export type ReviewFilterType = "newest" | "lowest" | "highest"

export type OfferType = "FIXED_PRICE" | "DISCOUNT"
export type DiscountType = "PERCENTAGE" | "AMOUNT"
export type PaymentMethod = "CASH" | "CARD"
export type Country = "DE"
export type RegisterStatus = "ACTIVE" | "INACTIVE"

export type Weekday =
	| "MONDAY"
	| "TUESDAY"
	| "WEDNESDAY"
	| "THURSDAY"
	| "FRIDAY"
	| "SATURDAY"
	| "SUNDAY"

export type ErrorCode =
	| typeof ErrorCodes.printerAlreadyExists
	| typeof ErrorCodes.tableAlreadyExists
	| typeof ErrorCodes.categoryNameAlreadyInUse
	| typeof ErrorCodes.registerAlreadyActive
	| typeof ErrorCodes.noActiveSubscription
	| typeof ErrorCodes.notAuthenticated
	| typeof ErrorCodes.userHasNoPassword
	| typeof ErrorCodes.userAlreadyHasPassword
	| typeof ErrorCodes.nameTooShort
	| typeof ErrorCodes.passwordTooShort
	| typeof ErrorCodes.nameTooLong
	| typeof ErrorCodes.passwordTooLong
	| typeof ErrorCodes.cityTooLong
	| typeof ErrorCodes.line1TooLong
	| typeof ErrorCodes.line2TooLong
	| typeof ErrorCodes.postalCodeInvalid
	| typeof ErrorCodes.ipAddressInvalid
	| typeof ErrorCodes.tableNameInvalid
	| typeof ErrorCodes.seatsInvalid

export interface TimeSlotSuggestion {
	time: string
	availableSeats: number
	table: {
		uuid: string
		name: number
		seats: number
	}
}

export enum RatingNum {
	One = 1,
	Two = 2,
	Three = 3,
	Four = 4,
	Five = 5
}
