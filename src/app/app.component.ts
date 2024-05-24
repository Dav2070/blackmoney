import { Component } from "@angular/core"
import { DataService } from "./services/data-service"
import { AuthService } from "./services/auth-service"

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrl: "./app.component.scss"
})
export class AppComponent {
	constructor(
		private dataService: DataService,
		private authService: AuthService
	) {}

	ngOnInit() {
		let accessToken = this.authService.getAccessToken()

		if (accessToken != null) {
			this.dataService.loadApollo(accessToken)
		}
	}
}
