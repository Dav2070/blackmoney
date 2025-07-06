import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"

@Component({
	templateUrl: "./onboarding-page.component.html",
	styleUrl: "./onboarding-page.component.scss",
	standalone: false
})
export class OnboardingPageComponent {
	context: "createCompany" | "createOwner" | "createUsers" = null
	restaurantUuid: string = ""
	restaurantName: string = ""
	ownerName: string = ""
	ownerPassword: string = ""
	employeeName: string = ""
	employees: string[] = []

	constructor(
		public dataService: DataService,
		private apiService: ApiService,
		private router: Router
	) {}

	async ngOnInit() {
		await this.dataService.companyPromiseHolder.AwaitResult()

		if (this.dataService.company == null) {
			this.context = "createCompany"
		} else if (this.dataService.restaurant.users.length === 0) {
			this.restaurantUuid = this.dataService.restaurant.uuid
			this.context = "createOwner"
		} else if (this.dataService.restaurant.users.length === 1) {
			this.restaurantUuid = this.dataService.restaurant.uuid
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
			restaurantUuid: this.restaurantUuid,
			name: this.employeeName
		})
		this.employees.push(this.employeeName)
		this.employeeName = ""
	}

	async continueButtonClick() {
		if (this.context === "createCompany") {
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

			this.restaurantUuid =
				createCompanyResponse.data.createCompany.restaurants.items[0].uuid

			this.context = "createOwner"
		} else if (this.context === "createOwner") {
			// TODO: Implement error handling
			const createOwnerResponse = await this.apiService.createOwner(`uuid`, {
				restaurantUuid: this.restaurantUuid,
				name: this.ownerName,
				password: this.ownerPassword
			})

			if (createOwnerResponse.errors == null) {
				this.context = "createUsers"
			}
		} else if (this.context === "createUsers") {
			this.router.navigate(["login"])
		}
	}
}
