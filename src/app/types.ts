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
}

export interface ProductResource {
	name: string
}

export interface CategoryResource {
	name: string
}
