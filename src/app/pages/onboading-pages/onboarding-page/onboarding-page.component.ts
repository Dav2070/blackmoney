import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { ApiService } from "src/app/services/api-service"
import { AuthService } from "src/app/services/auth-service"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { SettingsService } from "src/app/services/settings-service"
import { convertUserResourceToUser, getSerialNumber } from "src/app/utils"

@Component({
	templateUrl: "./onboarding-page.component.html",
	styleUrl: "./onboarding-page.component.scss",
	standalone: false
})
export class OnboardingPageComponent {
	locale = this.localizationService.locale.onboardingPage
	actionsLocale = this.localizationService.locale.actions
	context: "createCompany" | "createOwner" | "createUsers" = null
	companyUuid: string = ""
	restaurantUuid: string = ""
	restaurantName: string = ""
	ownerName: string = ""
	ownerPassword: string = ""
	employeeName: string = ""
	employees: string[] = []
	createCompanyLoading: boolean = false
	createOwnerLoading: boolean = false

	constructor(
		public dataService: DataService,
		private apiService: ApiService,
		private authService: AuthService,
		private settingsService: SettingsService,
		private localizationService: LocalizationService,
		private router: Router
	) {}

	async ngOnInit() {
		await this.dataService.companyPromiseHolder.AwaitResult()

		if (this.dataService.company == null) {
			this.context = "createCompany"
		} else if (this.dataService.restaurant?.users.length === 0) {
			this.context = "createOwner"
		} else if (this.dataService.restaurant?.users.length === 1) {
			this.context = "createUsers"
		}
	}

	restaurantNameChange(event: Event) {
		this.restaurantName = (event as CustomEvent).detail.value
	}

	ownerNameChange(event: Event) {
		this.ownerName = (event as CustomEvent).detail.value
	}

	ownerPasswordChange(event: Event) {
		this.ownerPassword = (event as CustomEvent).detail.value
	}

	employeeNameChange(event: Event) {
		this.employeeName = (event as CustomEvent).detail.value
	}

	async addEmployeeButtonClick() {
		await this.apiService.createUser(`uuid`, {
			companyUuid: this.companyUuid,
			name: this.employeeName,
			restaurants: [this.restaurantUuid]
		})
		this.employees.push(this.employeeName)
		this.employeeName = ""
	}

	async continueButtonClick() {
		if (this.context === "createCompany") {
			this.createCompanyLoading = true

			// TODO: Implement error handling
			const createCompanyResponse = await this.apiService.createCompany(
				`
					uuid
					restaurants {
						items {
							uuid
						}
					}
				`,
				{
					name: this.restaurantName
				}
			)

			this.createCompanyLoading = false
			this.companyUuid = createCompanyResponse.data.createCompany.uuid
			this.restaurantUuid =
				createCompanyResponse.data.createCompany.restaurants.items[0].uuid

			this.context = "createOwner"
		} else if (this.context === "createOwner") {
			// TODO: Implement error handling
			this.createOwnerLoading = true

			const createOwnerResponse = await this.apiService.createOwner(
				`
					uuid
					company {
						restaurants {
							items {
								registers {
									items {
										uuid
									}
								}
							}
						}
					}
				`,
				{
					companyUuid: this.companyUuid || this.dataService.company?.uuid,
					name: this.ownerName,
					password: this.ownerPassword
				}
			)

			if (createOwnerResponse.errors == null) {
				// Log in as the owner
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
						companyUuid:
							this.companyUuid || this.dataService.company?.uuid,
						userName: this.ownerName,
						password: this.ownerPassword,
						registerUuid:
							createOwnerResponse.data.createOwner.company.restaurants
								.items[0].registers.items[0].uuid,
						registerClientSerialNumber: await getSerialNumber(
							this.settingsService
						)
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
				}

				this.context = "createUsers"
			}

			this.createOwnerLoading = false
		} else if (this.context === "createUsers") {
			this.router.navigate(["login"])
		}
	}
}
