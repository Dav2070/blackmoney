import { Component } from "@angular/core"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"

@Component({
	templateUrl: "./onboarding-page.component.html",
	styleUrl: "./onboarding-page.component.scss",
	standalone: false
})
export class OnboardingPageComponent {
	restaurantName: string = ""

	constructor(
		public dataService: DataService,
		private apiService: ApiService
	) {}

	restaurantNameChange(event: Event) {
		this.restaurantName = (event as CustomEvent).detail.value
	}

	async continueButtonClick() {
		// TODO: Implement error handling
		await this.apiService.createCompany(`uuid`, {
			name: this.restaurantName
		})
	}
}
