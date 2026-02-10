import { Category } from "./Category"
import { Offer } from "./Offer"
import { Variation } from "./Variation"

export class Menu {
	uuid: string
	categories: Category[]
	variations: Variation[]
	offers: Offer[]
}
