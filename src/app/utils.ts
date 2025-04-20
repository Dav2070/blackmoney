import { Company } from "./models/Company"
import { User } from "./models/User"
import { Room } from "./models/Room"
import {
	CompanyResource,
	RoomResource,
	TableResource,
	UserResource
} from "./types"
import { Table } from "./models/Table"

export function convertCompanyResourceToCompany(
	companyResource: CompanyResource
): Company {
	if (companyResource == null) {
		return null
	}

	const users: User[] = []

	for (let user of companyResource.users.items) {
		users.push(convertUserResourceToUser(user))
	}

	const rooms: Room[] = []

	for (let room of companyResource.rooms.items) {
		rooms.push(convertRoomResourceToRoom(room))
	}

	return {
		uuid: companyResource.uuid,
		name: companyResource.name,
		users,
		rooms
	}
}

export function convertUserResourceToUser(userResource: UserResource): User {
	if (userResource == null) {
		return null
	}

	return {
		uuid: userResource.uuid,
		name: userResource.name
	}
}

export function convertRoomResourceToRoom(roomResource: RoomResource): Room {
	if (roomResource == null) {
		return null
	}

	const tables: Table[] = []

	for (let table of roomResource.tables.items) {
		tables.push(convertTableResourceToTable(table))
	}

	return {
		uuid: roomResource.uuid,
		name: roomResource.name,
		tables
	}
}

export function convertTableResourceToTable(
	tableResource: TableResource
): Table {
	if (tableResource == null) {
		return null
	}

	return {
		uuid: tableResource.uuid,
		name: tableResource.name
	}
}
