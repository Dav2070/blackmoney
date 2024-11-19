import { Injectable } from "@angular/core"
import { isServer } from "../utils"

const accessTokenKey = "ACCESS_TOKEN"

@Injectable()
export class AuthService {
	private accessToken: string = null

	getAccessToken() {
		if (isServer()) return null

		if (this.accessToken == null) {
			this.accessToken = localStorage.getItem(accessTokenKey)
		}

		return this.accessToken
	}

	setAccessToken(accessToken: string) {
		if (isServer()) return

		this.accessToken = accessToken
		localStorage.setItem(accessTokenKey, accessToken)
	}
}
