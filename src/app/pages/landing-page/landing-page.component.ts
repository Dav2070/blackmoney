import { Component } from "@angular/core"
import { Dav } from "dav-js"
import { environment } from "src/environments/environment"

@Component({
	templateUrl: "./landing-page.component.html",
	styleUrl: "./landing-page.component.scss"
})
export class LandingPageComponent {
	navigateToLoginPage() {
		Dav.ShowLoginPage(environment.davApiKey, window.location.origin)
	}
}
