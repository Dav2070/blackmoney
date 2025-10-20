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
	city: string
	country: Country
	line1: string
	line2: string
	postalCode: string
	menu: MenuResource
	users: List<UserResource>
	rooms: List<RoomResource>
	printers: List<PrinterResource>
}

export interface UserResource {
	uuid: string
	name: string
	role: UserRole
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

export interface MenuResource {
	uuid: string
	categories: List<CategoryResource>
	offers: List<OfferResource>
}

export interface OfferResource {
	id: number
	uuid: string
	name: string
	offerType: OfferType
	discountType?: DiscountType
	offerValue: number
	startDate?: string
	endDate?: string
	startTime?: string
	endTime?: string
	weekdays: Weekday[]
	offerItems: List<OfferItemResource>
}

export interface OfferItemResource {
	uuid: string
	name: string
	maxSelections: number
	products: List<ProductResource>
}

export interface ProductResource {
	id: number
	uuid: string
	name: string
	price: number
	category: CategoryResource
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
	type: CategoryType
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
	type: "product" | "menu" | "special"
	order: OrderResource
	product: ProductResource
	orderItemVariations: List<OrderItemVariationResource>
}

export interface OrderItemVariationResource {
	uuid: string
	count: number
	variationItems: List<VariationItemResource>
}

export type UserRole = "OWNER" | "ADMIN" | "USER"
export type CategoryType = "FOOD" | "DRINK"
export type OfferType = "FIXED_PRICE" | "DISCOUNT"
export type DiscountType = "PERCENTAGE" | "AMOUNT"
export type PaymentMethod = "CASH" | "CARD"
export type Country = "DE"

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
