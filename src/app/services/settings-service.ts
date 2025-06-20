import { Injectable } from "@angular/core"
import * as localforage from "localforage"
import { settingsRestaurantKey } from "../constants"

@Injectable()
export class SettingsService {
	cache: {
		[key: string]: any
	} = {}

	//#region Restaurant
	async setRestaurant(value: string) {
		await localforage.setItem(settingsRestaurantKey, value)
		this.cache[settingsRestaurantKey] = value
	}

	async getRestaurant(): Promise<string> {
		return this.getSetting<string>(settingsRestaurantKey, null)
	}
	//#endregion

	private async getSetting<T>(key: string, defaultValue: T): Promise<T> {
		let cachedValue = this.cache[key]
		if (cachedValue != null) return cachedValue

		let value = (await localforage.getItem(key)) as T
		if (value == null) value = defaultValue

		this.cache[key] = value
		return value
	}
}
