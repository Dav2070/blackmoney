import { StripeOnboardingStatus } from "../types"
import { Restaurant } from "./Restaurant"
import { User } from "./User"

export class Company {
	uuid: string
	name: string
	stripeOnboardingStatus: StripeOnboardingStatus
	restaurants: Restaurant[]
	users: User[]
}
