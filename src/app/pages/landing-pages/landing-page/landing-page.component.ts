import { Component } from "@angular/core"
import { Router, NavigationEnd } from "@angular/router"
import { faHouse as faHouseSolid } from "@fortawesome/free-solid-svg-icons"
import { faCircleDollar as faCircleDollarSolid } from "@fortawesome/pro-solid-svg-icons"
import {
	faHouse as faHouseRegular,
	faCircleUser as faCircleUserRegular,
	faCircleDollar as faCircleDollarRegular
} from "@fortawesome/pro-regular-svg-icons"
import { Dav } from "dav-js"
import { DataService } from "src/app/services/data-service"
import { environment } from "src/environments/environment"

@Component({
	templateUrl: "./landing-page.component.html",
	styleUrl: "./landing-page.component.scss",
	standalone: false
})
export class LandingPageComponent {
	faCircleUserRegular = faCircleUserRegular
	faHouseSolid = faHouseSolid
	faHouseRegular = faHouseRegular
	faCircleDollarSolid = faCircleDollarSolid
	faCircleDollarRegular = faCircleDollarRegular
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
		if (this.dataService.dav.isLoggedIn) {
			this.router.navigate(["user"])
		} else {
			Dav.ShowLoginPage(environment.davApiKey, window.location.origin)
		}
	}
}
