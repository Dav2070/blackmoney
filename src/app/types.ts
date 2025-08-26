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
	orders: List<OrderResource>
}

export interface PrinterResource {
	uuid: string
	name: string
	ipAddress: string
}

export interface ProductResource {
	id: number
	uuid: string
	name: string
	price: number
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
	order: OrderResource
	product: ProductResource
	orderItemVariations: List<OrderItemVariationResource>
}

export interface OrderItemVariationResource {
	uuid: string
	count: number
	variationItems: List<VariationItemResource>
}

export type CategoryType = "FOOD" | "DRINK"
export type PaymentMethod = "CASH" | "CARD"
export type UserRole = "OWNER" | "ADMIN" | "USER"
export type Country = "DE"

export type ErrorCode =
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
