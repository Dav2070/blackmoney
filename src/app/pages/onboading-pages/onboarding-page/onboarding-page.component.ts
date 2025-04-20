import { Component } from "@angular/core"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"

@Component({
	templateUrl: "./onboarding-page.component.html",
	styleUrl: "./onboarding-page.component.scss",
	standalone: false
})
export class OnboardingPageComponent {
	context: "createCompany" | "createUsers" = null
	restaurantName: string = ""
	employeeName: string = ""
	employees: string[] = []

	constructor(
		public dataService: DataService,
		private apiService: ApiService
	) {}

	async ngOnInit() {
		await this.dataService.companyPromiseHolder.AwaitResult()

		if (this.dataService.company == null) {
			this.context = "createCompany"
		} else if (this.dataService.company.users.length === 0) {
			this.context = "createUsers"
		}
	}

	restaurantNameChange(event: Event) {
		this.restaurantName = (event as CustomEvent).detail.value
	}

	employeeNameChange(event: Event) {
		this.employeeName = (event as CustomEvent).detail.value
	}

	addEmployeeButtonClick() {
		this.employees.push(this.employeeName)
		this.employeeName = ""
	}

	async continueButtonClick() {
		if (this.context === "createCompany") {
			// TODO: Implement error handling
			await this.apiService.createCompany(`uuid`, {
				name: this.restaurantName
			})

			this.context = "createUsers"
		}
	}
}
