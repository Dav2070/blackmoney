import { StripeOnboardingStatus, StripeSubscriptionStatus } from "../types"
import { Restaurant } from "./Restaurant"
import { User } from "./User"

export class Company {
	uuid: string
	name: string
	stripeOnboardingStatus: StripeOnboardingStatus
	stripeSubscriptionStatus: StripeSubscriptionStatus
	restaurants: Restaurant[]
	users: User[]
}
