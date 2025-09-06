import { MenuItem } from "./MenuItem"
import { DiscountType, OfferType, Weekday } from "../types"

export class Menu {
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
	menuItems: MenuItem[]
}
