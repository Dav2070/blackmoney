import { Component } from "@angular/core"
import { Dav } from "dav-js"
import { DataService } from "src/app/services/data-service"
import { environment } from "src/environments/environment"

@Component({
	templateUrl: "./landing-overview-page.component.html",
	styleUrl: "./landing-overview-page.component.scss",
	standalone: false
})
export class LandingOverviewPageComponent {
	constructor(public dataService: DataService) {}

	navigateToLoginPage() {
		Dav.ShowLoginPage(environment.davApiKey, window.location.origin)
	}
}
