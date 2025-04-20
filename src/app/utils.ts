import { Company } from "./models/Company"
import { User } from "./models/User"
import { CompanyResource, UserResource } from "./types"

export function isClient(): boolean {
	return typeof navigator != "undefined"
}

export function isServer(): boolean {
	return typeof navigator == "undefined"
}

export function convertCompanyResourceToCompany(
	companyResource: CompanyResource
): Company {
	const users: User[] = []

	for (let user of companyResource.users.items) {
		users.push(convertUserResourceToUser(user))
	}

	return {
		uuid: companyResource.uuid,
		name: companyResource.name,
		users
	}
}

export function convertUserResourceToUser(userResource: UserResource): User {
	return {
		uuid: userResource.uuid,
		name: userResource.name
	}
}
