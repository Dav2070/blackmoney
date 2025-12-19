import { Restaurant } from "./Restaurant"
import { User } from "./User"

export class Company {
	uuid: string
	name: string
	restaurants: Restaurant[]
	users: User[]
}
