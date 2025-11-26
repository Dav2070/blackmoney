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
	registers: List<RegisterResource>
	printers: List<PrinterResource>
}

export interface RegisterResource {
	uuid: string
	name: string
	registerClients: List<RegisterClientResource>
}

export interface RegisterClientResource {
	uuid: string
	name: string
	serialNumber: string
	printRules: List<PrintRuleResource>
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
	id: number
	uuid: string
	type: ProductType
	name: string
	price: number
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
	notes?: string
	takeAway: boolean
	course?: number
	order: OrderResource
	product: ProductResource
	orderItems: List<OrderItemResource>
	orderItemVariations: List<OrderItemVariationResource>
}

export interface OrderItemVariationResource {
	uuid: string
	count: number
	variationItems: List<VariationItemResource>
}

export interface AddProductsInput {
	uuid: string
	count: number
	variations?: AddProductVariationInput[]
	orderItems?: AddProductOrderItemInput[]
}

export interface AddProductVariationInput {
	variationItemUuids: string[]
	count: number
}

export interface AddProductOrderItemInput {
	productUuid: string
	count: number
}

export type UserRole = "OWNER" | "ADMIN" | "USER"
export type ProductType = "FOOD" | "DRINK" | "SPECIAL" | "MENU"
export type PrintRuleType = "BILLS" | "PRODUCT_TYPE" | "CATEGORIES" | "PRODUCTS"

export enum OrderItemType {
	Product = "PRODUCT",
	Menu = "MENU",
	Special = "SPECIAL"
}

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
	| typeof ErrorCodes.tableAlreadyExists
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
