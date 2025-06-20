import { User } from "./User"
import { Room } from "./Room"

export class Restaurant {
	uuid: string
	name: string
	users: User[]
	rooms: Room[]
}
