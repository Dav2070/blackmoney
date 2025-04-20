import { Injectable, Inject, PLATFORM_ID } from "@angular/core"
import { isPlatformServer } from "@angular/common"

const accessTokenKey = "ACCESS_TOKEN"

@Injectable()
export class AuthService {
	private accessToken: string = null

	constructor(@Inject(PLATFORM_ID) private platformId: object) {}

	getAccessToken() {
		if (isPlatformServer(this.platformId)) return null

		if (this.accessToken == null) {
			this.accessToken = localStorage.getItem(accessTokenKey)
		}

		return this.accessToken
	}

	setAccessToken(accessToken: string) {
		if (isPlatformServer(this.platformId)) return

		this.accessToken = accessToken
		localStorage.setItem(accessTokenKey, accessToken)
	}
}
