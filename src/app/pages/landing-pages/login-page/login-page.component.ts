import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { DropdownOption, DropdownOptionType } from "dav-ui-components"
import { Company } from "src/app/models/Company"
import { Restaurant } from "src/app/models/Restaurant"
import { ApiService } from "src/app/services/api-service"
import { AuthService } from "src/app/services/auth-service"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { SettingsService } from "src/app/services/settings-service"
import {
	convertCompanyResourceToCompany,
	getGraphQLErrorCodes,
	getSerialNumber,
	initUserAfterLogin
} from "src/app/utils"

@Component({
	templateUrl: "./login-page.component.html",
	styleUrl: "./login-page.component.scss",
	standalone: false
})
export class LoginPageComponent {
	locale = this.localizationService.locale.loginPage
	company: Company = null
	selectedRestaurant: Restaurant = null
	registerDropdownOptions: DropdownOption[] = []
	registerDropdownSelectedKey: string = ""
	userDropdownOptions: DropdownOption[] = []
	userDropdownSelectedKey: string = ""
	restaurantDropdownOptions: DropdownOption[] = []
	restaurantDropdownSelectedKey: string = ""
	uuid: string = ""
	username: string = ""
	password: string = ""
	errorMessage: string = ""
	initialLoad: boolean = true
	loading: boolean = false

	constructor(
		private router: Router,
		public dataService: DataService,
		private apiService: ApiService,
		private authService: AuthService,
		private settingsService: SettingsService,
		private localizationService: LocalizationService
	) {}

	async ngOnInit() {
		if ((await this.authService.getAccessToken()) != null) {
			// Redirect to tables page
			this.router.navigate(["dashboard"])
			return
		}

		await this.dataService.davUserPromiseHolder.AwaitResult()
		await this.dataService.companyPromiseHolder.AwaitResult()

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
						registers {
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

		this.loadDropdownOptions()
		this.initialLoad = false
	}

	loadDropdownOptions() {
		this.userDropdownOptions = []

		this.selectedRestaurant = this.company.restaurants.find(
			r => r.uuid === this.restaurantDropdownSelectedKey
		)
		if (this.selectedRestaurant == null) return

		for (let register of this.selectedRestaurant.registers) {
			this.registerDropdownOptions.push({
				key: register.uuid,
				value: register.name,
				type: DropdownOptionType.option
			})
		}

		for (let user of this.selectedRestaurant.users) {
			this.userDropdownOptions.push({
				key: user.uuid,
				value: user.name,
				type: DropdownOptionType.option
			})
		}
	}

	restaurantDropdownChange(event: Event) {
		this.restaurantDropdownSelectedKey = (event as CustomEvent).detail.key
		this.loadDropdownOptions()
	}

	registerDropdownChange(event: Event) {
		this.registerDropdownSelectedKey = (event as CustomEvent).detail.key
	}

	userDropdownChange(event: Event) {
		this.userDropdownSelectedKey = (event as CustomEvent).detail.key

		const selectedRestaurant = this.company.restaurants.find(
			r => r.uuid === this.restaurantDropdownSelectedKey
		)

		let selectedUser = selectedRestaurant.users.find(
			u => u.uuid === this.userDropdownSelectedKey
		)

		if (selectedUser != null) {
			this.uuid = selectedUser.uuid
			this.username = selectedUser.name
		}
	}

	passwordChange(event: Event) {
		this.password = (event as CustomEvent).detail.value
	}

	async login() {
		this.errorMessage = ""
		this.loading = true

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
				password: this.password,
				registerUuid: "",
				registerClientSerialNumber: await getSerialNumber(
					this.settingsService
				)
			}
		)

		this.loading = false
		const accessToken = loginResponse?.data?.login.uuid

		if (accessToken != null) {
			await initUserAfterLogin(
				accessToken,
				this.restaurantDropdownSelectedKey,
				loginResponse.data.login.user,
				this.apiService,
				this.authService,
				this.dataService,
				this.settingsService,
				this.router
			)
		} else {
			const errors = getGraphQLErrorCodes(loginResponse)

			if (errors == null) {
				this.errorMessage = this.locale.loginFailed
				return
			}

			if (errors.includes("USER_HAS_NO_PASSWORD")) {
				this.router.navigate(["login", "set-password"], {
					queryParams: {
						uuid: this.uuid,
						restaurantUuid: this.restaurantDropdownSelectedKey,
						name: this.username
					}
				})
			} else {
				this.errorMessage = this.locale.loginFailed
			}
		}
	}
}
