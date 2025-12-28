import { Rating } from "./Rating"
import { Address } from "./Address"

export class RestaurantDetails {
	uuid: string
	owner?: string
	taxNumber?: string
	phoneNumber?: string
	mail?: string
	rating?: Rating
	address?: Address
	hasTakeaway?: boolean
	hasDineIn?: boolean
}
