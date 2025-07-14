import { Injectable, Inject, PLATFORM_ID } from "@angular/core"
import { isPlatformServer } from "@angular/common"
import * as localforage from "localforage"

const accessTokenKey = "accessToken"

@Injectable()
export class AuthService {
	private accessToken: string = null

	constructor(@Inject(PLATFORM_ID) private platformId: object) {}

	async getAccessToken() {
		if (isPlatformServer(this.platformId)) return null

		if (this.accessToken == null) {
			this.accessToken = await localforage.getItem(accessTokenKey)
		}

		return this.accessToken
	}

	async setAccessToken(accessToken: string) {
		if (isPlatformServer(this.platformId)) return

		this.accessToken = accessToken
		await localforage.setItem(accessTokenKey, accessToken)
	}

	async removeAccessToken() {
		if (isPlatformServer(this.platformId)) return

		this.accessToken = null
		await localforage.removeItem(accessTokenKey)
	}
}
