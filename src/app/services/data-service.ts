import { Injectable, Inject, PLATFORM_ID } from "@angular/core"
import { isPlatformServer } from "@angular/common"
import { HttpHeaders } from "@angular/common/http"
import { InMemoryCache } from "@apollo/client/core"
import { Apollo } from "apollo-angular"
import { HttpLink } from "apollo-angular/http"
import { Dav, PromiseHolder } from "dav-js"
import * as DavUIComponents from "dav-ui-components"
import { User } from "../models/User"
import { Company } from "../models/Company"
import { Restaurant } from "../models/Restaurant"
import { Register } from "../models/Register"
import { RegisterClient } from "../models/RegisterClient"
import { SettingsService } from "./settings-service"
import { environment } from "src/environments/environment"
import {
	blackmoneyAuthClientName,
	darkThemeKey,
	lightThemeKey,
	themeKey
} from "../constants"
import { Theme } from "../types"
import { convertStringToTheme } from "../utils"

@Injectable()
export class DataService {
	dav = Dav
	davUserPromiseHolder = new PromiseHolder<User>()
	blackmoneyUserPromiseHolder = new PromiseHolder<User>()
	companyPromiseHolder = new PromiseHolder<Company>()
	restaurantPromiseHolder = new PromiseHolder<Restaurant>()
	registerPromiseHolder = new PromiseHolder<Register>()
	registerClientPromiseHolder = new PromiseHolder<RegisterClient>()
	user: User = null
	company: Company = null
	restaurant: Restaurant = null
	register: Register = null
	registerClient: RegisterClient = null
	isMobile: boolean = false
	darkTheme: boolean = false

	constructor(
		private apollo: Apollo,
		private httpLink: HttpLink,
		private settingsService: SettingsService,
		@Inject(PLATFORM_ID) private platformId: object
	) {}

	loadApollo(accessToken: string) {
		this.apollo.removeClient(blackmoneyAuthClientName)

		this.apollo.create(
			{
				cache: new InMemoryCache(),
				link: this.httpLink.create({
					uri: environment.apiUrl,
					headers: new HttpHeaders().set(
						"Authorization",
						accessToken ?? ""
					)
				})
			},
			blackmoneyAuthClientName
		)
	}

	async loadTheme(theme?: Theme) {
		if (isPlatformServer(this.platformId)) return

		if (theme == null) {
			// Get the theme from the settings
			theme = convertStringToTheme(await this.settingsService.getTheme())
		}

		switch (theme) {
			case Theme.Dark:
				this.darkTheme = true
				break
			case Theme.System:
				// Get the browser theme
				let darkTheme = false

				if (window.matchMedia) {
					let colorScheme = window.matchMedia(
						"(prefers-color-scheme: dark)"
					)

					darkTheme = colorScheme.matches
					colorScheme.onchange = () => this.loadTheme()
				}

				this.darkTheme = darkTheme
				break
			default:
				this.darkTheme = false
				break
		}

		document.body.setAttribute(
			themeKey,
			this.darkTheme ? darkThemeKey : lightThemeKey
		)

		DavUIComponents.setTheme(
			this.darkTheme
				? DavUIComponents.Theme.dark
				: DavUIComponents.Theme.light
		)
	}
}
