import { User } from "./User"
import { Room } from "./Room"
import { Printer } from "./Printer"
import { Menu } from "./Menu"
import { Country } from "../types"

export class Restaurant {
	uuid: string
	name: string
	city: string
	country: Country
	line1: string
	line2: string
	postalCode: string
	users: User[]
	rooms: Room[]
	printers: Printer[]
	menu: Menu
}
