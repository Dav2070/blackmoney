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

export interface OrderResource {
	uuid: string
	totalPrice: number
	products: List<ItemResource>
}

export interface ItemResource {
	uuid: string
	name: string
	price: number
	total: number
	pickedVariations: PickedVariationResource[]
}

export interface PickedVariationResource {
	total: number
	variations: VariationItemResource[]
}

export type CategoryType = "FOOD" | "DRINK"
