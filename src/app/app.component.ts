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
	convertUserResourceToUser
} from "src/app/utils"
import { davAuthClientName, blackmoneyAuthClientName } from "src/app/constants"

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

		// Get the company
		let retrieveCompanyResponse = await this.apiService.retrieveCompany(
			`
				uuid
				name
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
			`
		)

		let retrieveCompanyResponseData =
			retrieveCompanyResponse.data.retrieveCompany

		if (retrieveCompanyResponseData != null) {
			this.dataService.company = convertCompanyResourceToCompany(
				retrieveCompanyResponseData
			)

			this.dataService.companyPromiseHolder.Resolve()

			if (retrieveCompanyResponseData.users.total == 0) {
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

				if (retrieveUserResponse.data.retrieveUser != null) {
					this.dataService.user = convertUserResourceToUser(
						retrieveUserResponse.data.retrieveUser
					)
					this.dataService.blackmoneyUserPromiseHolder.Resolve()

					// Redirect to the tables page
					this.router.navigate(["tables"])
				}
			}
		}
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
