import { OfferItem } from "./OfferItem"
import { Product } from "./Product"
import { DiscountType, OfferType, Weekday } from "../types"

export class Offer {
	id: number
	uuid: string
	offerType: OfferType
	discountType?: DiscountType
	offerValue: number
	startDate?: Date
	endDate?: Date
	startTime?: string
	endTime?: string
	weekdays: Weekday[]
	product?: Product
	offerItems: OfferItem[]
}
