import { Component } from "@angular/core"
import { Dav } from "dav-js"
import { environment } from "src/environments/environment"

@Component({
	templateUrl: "./landing-overview-page.component.html",
	styleUrl: "./landing-overview-page.component.scss",
	standalone: false
})
export class LandingOverviewPageComponent {
	navigateToLoginPage() {
		Dav.ShowLoginPage(environment.davApiKey, window.location.origin)
	}
}
