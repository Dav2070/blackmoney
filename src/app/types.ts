export interface List<T> {
	total: number
	items: T[]
}

export interface CompanyResource {
	uuid: string
	name: string
	users: List<UserResource>
}

export interface UserResource {
	uuid: string
	name: string
}

export interface RoomResource {
	name: string
	tables: List<TableResource>
}

export interface TableResource {
	uuid: string
	name: string
	orders: List<OrderResource>
}

export interface ProductResource {
	uuid: string
	count: number
	name: string
	price: number
	variations: List<VariationResource>
}

export interface VariationResource {
	uuid: string
	count: number
	name: string
	price: number
}

export interface CategoryResource {
	uuid: string
	name: string
	type: CategoryType
	products: List<ProductResource>
}

export interface OrderResource {
	uuid: string
	totalPrice: number
	products: List<ProductResource>
}

export type CategoryType = "FOOD" | "DRINK"
