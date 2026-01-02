import { User } from "./User"
import { Room } from "./Room"
import { Printer } from "./Printer"
import { Menu } from "./Menu"
import { Register } from "./Register"
import { Rating } from "./Rating"
import { Address } from "./Address"

export class Restaurant {
	uuid: string
	name: string
	menu: Menu
	users: User[]
	rooms: Room[]
	registers: Register[]
	printers: Printer[]
	images: string[]
	owner?: string
	taxNumber?: string
	phoneNumber?: string
	mail?: string
	ratings?: Rating[]
	address?: Address
	hasTakeaway?: boolean
	hasDelivery?: boolean
}
