import { RatingNum } from "../types"

export class Rating {
	uuid: string
	value: RatingNum
	review: string
	userUuid: string
	restaurantUuid: string
}
