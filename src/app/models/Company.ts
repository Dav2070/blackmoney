import { User } from "./User"
import { Room } from "./Room"

export class Company {
	uuid: string
	name: string
	users: User[]
	rooms: Room[]
}
