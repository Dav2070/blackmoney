import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { Dav } from "dav-js"
import { DataService } from "src/app/services/data-service"
import { environment } from "src/environments/environment"

@Component({
	templateUrl: "./landing-page.component.html",
	styleUrl: "./landing-page.component.scss"
})
export class LandingPageComponent {
	constructor(private dataService: DataService, private router: Router) {}

	async ngOnInit() {
		await this.dataService.userPromiseHolder.AwaitResult()

		if (this.dataService.dav.isLoggedIn) {
			this.router.navigate(["tables"])
			return
		}
	}

	navigateToLoginPage() {
		Dav.ShowLoginPage(environment.davApiKey, window.location.origin)
	}
}
