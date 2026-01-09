import { Component } from "@angular/core"
import { Router, NavigationEnd } from "@angular/router"
import { faHouse as faHouseSolid } from "@fortawesome/free-solid-svg-icons"
import {
	faCircleDollar as faCircleDollarSolid,
	faCartShopping as faCartShoppingSolid
} from "@fortawesome/pro-solid-svg-icons"
import {
	faHouse as faHouseRegular,
	faCircleUser as faCircleUserRegular,
	faCircleDollar as faCircleDollarRegular,
	faCartShopping as faCartShoppingRegular
} from "@fortawesome/pro-regular-svg-icons"
import { Dav } from "dav-js"
import { DataService } from "src/app/services/data-service"
import { AuthService } from "src/app/services/auth-service"
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
	faCartShoppingSolid = faCartShoppingSolid
	faCartShoppingRegular = faCartShoppingRegular
	overviewTabActive: boolean = false
	orderTabActive: boolean = false
	pricingTabActive: boolean = false
	userButtonSelected: boolean = false
	guestsTabActive: boolean = false

	constructor(
		private router: Router,
		public dataService: DataService,
		private authService: AuthService
	) {
		this.router.events.forEach((data: any) => {
			if (data instanceof NavigationEnd) {
				this.overviewTabActive = data.url == "/"
				this.orderTabActive = data.url.startsWith("/order")
				this.pricingTabActive = data.url.startsWith("/pricing")
				this.guestsTabActive = data.url.startsWith("/guests")
			}
		})
	}

	navigateToOverviewPage() {
		this.router.navigate([""])
	}

	navigateToOrderPage() {
		this.router.navigate(["order"])
	}

	navigateToPricingPage() {
		this.router.navigate(["pricing"])
	}

	navigateToGuestsPage() {
		this.router.navigate(["guests"])
	}

	async navigateToUserPage() {
		if (!this.dataService.dav.isLoggedIn) {
			Dav.ShowLoginPage(
				environment.davApiKey,
				`${window.location.origin}/login`
			)
		} else if ((await this.authService.getAccessToken()) != null) {
			this.router.navigate(["user"])
		} else {
			this.router.navigate(["login"])
		}
	}
}
