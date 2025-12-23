import { UserRole } from "../types"
import { Company } from "./Company"

export class User {
	uuid: string
	name: string
	role: UserRole
	company: Company
}
