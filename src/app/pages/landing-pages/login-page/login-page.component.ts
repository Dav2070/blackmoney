import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { DropdownOption, DropdownOptionType } from "dav-ui-components"
import { Company } from "src/app/models/Company"
import { ApiService } from "src/app/services/api-service"
import { AuthService } from "src/app/services/auth-service"
import { DataService } from "src/app/services/data-service"
import { SettingsService } from "src/app/services/settings-service"
import {
	convertCompanyResourceToCompany,
	convertUserResourceToUser
} from "src/app/utils"

@Component({
	templateUrl: "./login-page.component.html",
	styleUrl: "./login-page.component.scss",
	standalone: false
})
export class LoginPageComponent {
	company: Company = null
	userDropdownOptions: DropdownOption[] = []
	userDropdownSelectedKey: string = ""
	restaurantDropdownOptions: DropdownOption[] = []
	restaurantDropdownSelectedKey: string = ""
	username: string = ""
	password: string = ""
	errorMessage: string = ""

	constructor(
		private router: Router,
		public dataService: DataService,
		private apiService: ApiService,
		private authService: AuthService,
		private settingsService: SettingsService
	) {}

	async ngOnInit() {
		if ((await this.authService.getAccessToken()) != null) {
			// Redirect to tables page
			this.router.navigate(["dashboard"])
			return
		}

		await this.dataService.davUserPromiseHolder.AwaitResult()

		// Load the company with all restaurants and users
		const retrieveCompanyResponse = await this.apiService.retrieveCompany(
			`
				uuid
				restaurants {
					items {
						uuid
						name
						users {
							items {
								uuid
								name
							}
						}
					}
				}
			`
		)

		this.company = convertCompanyResourceToCompany(
			retrieveCompanyResponse.data.retrieveCompany
		)

		if (this.company == null) {
			this.router.navigate([""])
			return
		}

		for (let restaurant of this.company.restaurants) {
			this.restaurantDropdownOptions.push({
				key: restaurant.uuid,
				value: restaurant.name,
				type: DropdownOptionType.option
			})
		}

		const defaultRestaurantUuid = await this.settingsService.getRestaurant()

		if (defaultRestaurantUuid != null) {
			// Find the default restaurant
			let defaultRestaurant = this.dataService.company.restaurants.find(
				r => r.uuid === defaultRestaurantUuid
			)

			if (defaultRestaurant != null) {
				this.restaurantDropdownSelectedKey = defaultRestaurant.uuid
			}
		}

		if (this.restaurantDropdownSelectedKey === "") {
			// If no default restaurant is set, select the first one
			this.restaurantDropdownSelectedKey =
				this.dataService.company.restaurants[0].uuid
		}

		this.loadUserDropdownOptions()
	}

	loadUserDropdownOptions() {
		this.userDropdownOptions = []

		const selectedRestaurant = this.company.restaurants.find(
			r => r.uuid === this.restaurantDropdownSelectedKey
		)

		if (selectedRestaurant) {
			for (let user of selectedRestaurant.users) {
				this.userDropdownOptions.push({
					key: user.uuid,
					value: user.name,
					type: DropdownOptionType.option
				})
			}
		}
	}

	restaurantDropdownChange(event: Event) {
		this.restaurantDropdownSelectedKey = (event as CustomEvent).detail.key
		this.loadUserDropdownOptions()
	}

	userDropdownChange(event: Event) {
		this.userDropdownSelectedKey = (event as CustomEvent).detail.key

		const selectedRestaurant = this.company.restaurants.find(
			r => r.uuid === this.restaurantDropdownSelectedKey
		)

		let selectedUser = selectedRestaurant.users.find(
			u => u.uuid === this.userDropdownSelectedKey
		)

		this.username = selectedUser?.name ?? ""
	}

	passwordChange(event: Event) {
		this.password = (event as CustomEvent).detail.value
	}

	async login() {
		this.errorMessage = ""

		const loginResponse = await this.apiService.login(
			`
				uuid
				user {
					uuid
					name
					role
				}
			`,
			{
				companyUuid: this.company.uuid,
				userName: this.username,
				password: this.password
			}
		)

		const accessToken = loginResponse?.data?.login.uuid

		if (accessToken != null) {
			await this.authService.setAccessToken(accessToken)
			this.dataService.loadApollo(accessToken)
			this.apiService.loadApolloClients()

			this.dataService.user = convertUserResourceToUser(
				loginResponse.data.login.user
			)
			this.dataService.blackmoneyUserPromiseHolder.Resolve()

			await this.settingsService.setRestaurant(
				this.restaurantDropdownSelectedKey
			)

			// Redirect to user page
			this.router.navigate(["user"])
		} else {
			this.errorMessage = "Login failed"
		}
	}
}
