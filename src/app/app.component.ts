import { Component } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { Dav } from "dav-js"
import { DataService } from "./services/data-service"
import { environment } from "src/environments/environment"
import { isServer } from "src/app/utils"

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrl: "./app.component.scss"
})
export class AppComponent {
	constructor(
		private dataService: DataService,
		private activatedRoute: ActivatedRoute
	) {
		this.activatedRoute.queryParams.subscribe(async params => {
			if (params["accessToken"]) {
				// Log in with the access token
				await this.dataService.dav.Login(params["accessToken"])

				// Reload the page without accessToken in the url
				let url = new URL(window.location.href)
				url.searchParams.delete("accessToken")
				window.location.href = url.toString()
			}
		})
	}

	ngOnInit() {
		if (isServer()) {
			this.userLoaded()
			return
		}

		new Dav({
			environment: environment.environment,
			appId: environment.davAppId,
			tableIds: [],
			callbacks: {
				UserLoaded: () => this.userLoaded()
			}
		})
	}

	//#region dav callback functions
	userLoaded() {
		this.dataService.userPromiseHolder.Resolve()
	}
	//#endregion
}
