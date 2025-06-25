import { Component } from "@angular/core"
import { Router, NavigationEnd } from "@angular/router"
import { faCircleUser as faCircleUserSolid } from "@fortawesome/free-solid-svg-icons"
import { faCircleUser as faCircleUserRegular } from "@fortawesome/pro-regular-svg-icons"
import { DataService } from "src/app/services/data-service"

@Component({
	templateUrl: "./landing-page.component.html",
	styleUrl: "./landing-page.component.scss",
	standalone: false
})
export class LandingPageComponent {
	faCircleUserSolid = faCircleUserSolid
	faCircleUserRegular = faCircleUserRegular
	overviewTabActive: boolean = false
	pricingTabActive: boolean = false
	userButtonSelected: boolean = false

	constructor(private router: Router, public dataService: DataService) {
		this.router.events.forEach((data: any) => {
			if (data instanceof NavigationEnd) {
				this.overviewTabActive = data.url == "/"
				this.pricingTabActive = data.url.startsWith("/pricing")
			}
		})
	}

	navigateToOverviewPage() {
		this.router.navigate([""])
	}

	navigateToPricingPage() {
		this.router.navigate(["pricing"])
	}

	navigateToUserPage() {
		this.router.navigate(["user"])
	}
}
