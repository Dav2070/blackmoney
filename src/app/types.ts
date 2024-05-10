export interface List<T> {
	total: number
	items: T[]
}

export interface SessionResource {
	token: string
}

export interface RoomResource {
	name: string
	tables: List<TableResource>
}

export interface TableResource {
	name: string
}
