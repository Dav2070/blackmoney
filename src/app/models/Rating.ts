import { RatingNum } from "../types"

export class Rating {
	uuid: string
	username: string
	value: RatingNum
	review: string
	date: Date
	userUuid: string
}
