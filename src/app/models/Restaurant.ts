import { User } from "./User"
import { Room } from "./Room"
import { Printer } from "./Printer"
import { Menu } from "./Menu"
import { Register } from "./Register"
import { RestaurantDetails } from "./RestaurantDetails"

export class Restaurant {
	uuid: string
	name: string
	menu: Menu
	users: User[]
	rooms: Room[]
	registers: Register[]
	printers: Printer[]
	restaurantDetails: RestaurantDetails
}
