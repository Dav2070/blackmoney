import { Component, Inject, PLATFORM_ID } from "@angular/core"
import { isPlatformServer } from "@angular/common"
import { Router, ActivatedRoute } from "@angular/router"
import { HttpHeaders } from "@angular/common/http"
import { Apollo } from "apollo-angular"
import { HttpLink } from "apollo-angular/http"
import { InMemoryCache } from "@apollo/client/core"
import { Dav } from "dav-js"
import * as DavUIComponents from "dav-ui-components"
import { DataService } from "./services/data-service"
import { ApiService } from "./services/api-service"
import { AuthService } from "./services/auth-service"
import { environment } from "src/environments/environment"
import {
	convertCompanyResourceToCompany,
	convertUserResourceToUser,
	getGraphQLErrorCodes
} from "src/app/utils"
import { davAuthClientName, blackmoneyAuthClientName } from "src/app/constants"
import { SettingsService } from "./services/settings-service"

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrl: "./app.component.scss",
	standalone: false
})
export class AppComponent {
	constructor(
		private dataService: DataService,
		private apiService: ApiService,
		private authService: AuthService,
		private settingsService: SettingsService,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private apollo: Apollo,
		private httpLink: HttpLink,
		@Inject(PLATFORM_ID) private platformId: object
	) {
		DavUIComponents.setLocale("de")
		DavUIComponents.setTheme(DavUIComponents.Theme.dark)

		this.activatedRoute.queryParams.subscribe(async params => {
			if (params["accessToken"]) {
				// Log in with the access token
				await this.dataService.dav.Login(params["accessToken"])

				// Reload the page without accessToken in the url
				let url = new URL(window.location.href)
				url.searchParams.delete("accessToken")
				window.location.href = url.toString()
			}
		})
	}

	async ngOnInit() {
		if (isPlatformServer(this.platformId)) {
			this.userLoaded()
			return
		}

		new Dav({
			environment: environment.environment,
			appId: environment.davAppId,
			tableNames: [],
			callbacks: {
				UserLoaded: () => this.userLoaded(),
				AccessTokenRenewed: (accessToken: string) =>
					this.accessTokenRenewed(accessToken)
			}
		})

		await this.dataService.davUserPromiseHolder.AwaitResult()

		let accessToken = this.authService.getAccessToken()
		this.setupApollo(Dav.accessToken, accessToken)

		let retrieveCompanyResponse = await this.apiService.retrieveCompany(
			`
				uuid
				name
				restaurants {
					total
					items {
						uuid
						name
					}
				}
			`
		)

		let retrieveCompanyResponseData =
			retrieveCompanyResponse.data.retrieveCompany

		if (
			retrieveCompanyResponseData == null ||
			retrieveCompanyResponseData.restaurants.total == 0
		) {
			// Redirect to the onboarding page
			this.router.navigate(["onboarding"])
		} else {
			this.dataService.company = convertCompanyResourceToCompany(
				retrieveCompanyResponseData
			)

			// Try to get the current restaurant
			if (this.dataService.company.restaurants.length == 1) {
				this.dataService.restaurant =
					this.dataService.company.restaurants[0]
			} else {
				const restaurantUuid = await this.settingsService.getRestaurant()

				if (restaurantUuid != null) {
					this.dataService.restaurant =
						this.dataService.company.restaurants.find(
							r => r.uuid == restaurantUuid
						)
				} else {
					this.dataService.restaurant =
						this.dataService.company.restaurants[0]
				}
			}

			this.dataService.restaurantPromiseHolder.Resolve()

			// Retrieve the restaurant with rooms and users
			const retrieveRestaurantResponse =
				await this.apiService.retrieveRestaurant(
					`
					users {
						total
						items {
							uuid
							name
						}
					}
					rooms {
						total
						items {
							uuid
							name
							tables {
								total
								items {
									uuid
									name
								}
							}
						}
					}
				`,
					{
						uuid: this.dataService.restaurant.uuid
					}
				)

			const retrieveRestaurantResponseData =
				retrieveRestaurantResponse.data.retrieveRestaurant

			if (retrieveRestaurantResponseData.users.total == 0) {
				// Redirect to the onboarding page
				this.router.navigate(["onboarding"])
			} else if (accessToken == null) {
				// Redirect to the login page
				this.router.navigate(["login"])
			} else {
				// Load the current user
				let retrieveUserResponse = await this.apiService.retrieveUser(
					`
						uuid
						name
						role
					`
				)

				if (
					getGraphQLErrorCodes(retrieveUserResponse).includes(
						"NOT_AUTHENTICATED"
					)
				) {
					// Remove the access token
					this.authService.removeAccessToken()

					// Redirect to the login page
					this.router.navigate(["login"])
				} else if (retrieveUserResponse.data.retrieveUser != null) {
					this.dataService.user = convertUserResourceToUser(
						retrieveUserResponse.data.retrieveUser
					)

					if (this.router.url == "/") {
						// Redirect to the tables page
						this.router.navigate(["tables"])
					}
				}
			}
		}

		this.dataService.companyPromiseHolder.Resolve()
		this.dataService.blackmoneyUserPromiseHolder.Resolve()
	}

	setupApollo(davAccessToken: string, accessToken: string) {
		this.apollo.removeClient(davAuthClientName)
		this.apollo.removeClient(blackmoneyAuthClientName)

		this.apollo.create(
			{
				cache: new InMemoryCache(),
				link: this.httpLink.create({
					uri: environment.apiUrl,
					headers: new HttpHeaders().set(
						"Authorization",
						davAccessToken ?? ""
					)
				})
			},
			davAuthClientName
		)

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

		this.apiService.loadApolloClients()
	}

	//#region dav callback functions
	userLoaded() {
		let accessToken = this.authService.getAccessToken()

		// Setup the apollo client with the access token
		this.setupApollo(this.dataService.dav.accessToken, accessToken)

		this.dataService.davUserPromiseHolder.Resolve()
	}

	accessTokenRenewed(davAccessToken: string) {
		this.setupApollo(davAccessToken, this.authService.getAccessToken())
	}
	//#endregion
}
