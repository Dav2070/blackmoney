import { Component } from "@angular/core"
import { Router, NavigationEnd } from "@angular/router"

@Component({
	templateUrl: "./landing-page.component.html",
	styleUrl: "./landing-page.component.scss",
	standalone: false
})
export class LandingPageComponent {
	overviewTabActive: boolean = false
	pricingTabActive: boolean = false

	constructor(private router: Router) {
		this.router.events.forEach((data: any) => {
			if (data instanceof NavigationEnd) {
				this.overviewTabActive = data.url == "/"
				this.pricingTabActive = data.url.startsWith("/pricing")
			}
		})
	}

	navigateToOverviewPage() {
		this.router.navigate(["/"])
	}

	navigateToPricingPage() {
		this.router.navigate(["/pricing"])
	}
}
