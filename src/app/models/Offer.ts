import { OfferItem } from "./OfferItem"
import { DiscountType, OfferType, Weekday } from "../types"

export class Offer {
	uuid: string
	name: string
	offerType: OfferType
	discountType?: DiscountType
	offerValue: number
	startDate?: Date
	endDate?: Date
	startTime?: string
	endTime?: string
	weekdays: Weekday[]
	offerItems: OfferItem[]
}
