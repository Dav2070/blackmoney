import { Component } from "@angular/core"
import { DataService } from "src/app/services/data-service"

@Component({
	templateUrl: "./onboarding-page.component.html",
	styleUrl: "./onboarding-page.component.scss",
	standalone: false
})
export class OnboardingPageComponent {
	restaurantName: string = ""

	constructor(public dataService: DataService) { }
	
	restaurantNameChange(event: Event) {
		this.restaurantName = (event as CustomEvent).detail.value
	}
}
