import { User } from "./User"
import { Room } from "./Room"
import { Printer } from "./Printer"
import { Menu } from "./Menu"
import { Country } from "../types"
import { Register } from "./Register"

export class Restaurant {
	uuid: string
	name: string
	city: string
	country: Country
	line1: string
	line2: string
	postalCode: string
	menu: Menu
	users: User[]
	rooms: Room[]
	registers: Register[]
	printers: Printer[]
}
