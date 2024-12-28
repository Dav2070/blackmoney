import { Component } from "@angular/core"
import { Router, NavigationEnd } from "@angular/router"
import { DataService } from "src/app/services/data-service"

@Component({
	templateUrl: "./landing-page.component.html",
	styleUrl: "./landing-page.component.scss",
	standalone: false
})
export class LandingPageComponent {
	overviewTabActive: boolean = false
	pricingTabActive: boolean = false

	constructor(private dataService: DataService, private router: Router) {
		this.router.events.forEach((data: any) => {
			if (data instanceof NavigationEnd) {
				this.overviewTabActive = data.url == "/"
				this.pricingTabActive = data.url.startsWith("/pricing")
			}
		})
	}

	async ngOnInit() {
		await this.dataService.userPromiseHolder.AwaitResult()

		if (this.dataService.dav.isLoggedIn) {
			this.router.navigate(["tables"])
			return
		}
	}

	navigateToOverviewPage() {
		this.router.navigate(["/"])
	}

	navigateToPricingPage() {
		this.router.navigate(["/pricing"])
	}
}
