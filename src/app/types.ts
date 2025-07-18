export interface List<T> {
	total: number
	items: T[]
}

export interface SessionResource {
	uuid: string
	user: UserResource
}

export interface CompanyResource {
	uuid: string
	name: string
	restaurants: List<RestaurantResource>
}

export interface RestaurantResource {
	uuid: string
	name: string
	users: List<UserResource>
	rooms: List<RoomResource>
}

export interface UserResource {
	uuid: string
	name: string
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

export type ErrorCode = "NOT_AUTHENTICATED"
