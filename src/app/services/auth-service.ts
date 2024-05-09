import { Injectable } from "@angular/core"

const accessTokenKey = "ACCESS_TOKEN"

@Injectable()
export class AuthService {
	accessToken: string = null

	getAccessToken() {
		if (this.accessToken == null) {
			this.accessToken = localStorage.getItem(accessTokenKey)
		}

		return this.accessToken
	}

	setAccessToken(accessToken: string) {
		this.accessToken = accessToken
		localStorage.setItem(accessTokenKey, accessToken)
	}
}
