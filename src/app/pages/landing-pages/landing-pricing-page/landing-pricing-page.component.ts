import { Component } from "@angular/core"
import {
	faCalendarDays,
	faBagShopping,
	faMobile,
	faUsers,
	faDatabase,
	faWrench
} from "@fortawesome/duotone-regular-svg-icons"
import { Dav } from "dav-js"
import { DataService } from "src/app/services/data-service"
import { environment } from "src/environments/environment"

@Component({
	templateUrl: "./landing-pricing-page.component.html",
	styleUrl: "./landing-pricing-page.component.scss",
	standalone: false
})
export class LandingPricingPageComponent {
	faCalendarDays = faCalendarDays
	faBagShopping = faBagShopping
	faMobile = faMobile
	faUsers = faUsers
	faDatabase = faDatabase
	faWrench = faWrench

	constructor(public dataService: DataService) {}

	navigateToLoginPage() {
		Dav.ShowLoginPage(environment.davApiKey, window.location.origin)
	}
}
