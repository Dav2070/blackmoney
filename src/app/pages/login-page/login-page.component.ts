import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { ApiService } from "src/app/services/api-service"
import { AuthService } from "src/app/services/auth-service"
import { DataService } from "src/app/services/data-service"

@Component({
	templateUrl: "./login-page.component.html",
	styleUrl: "./login-page.component.scss",
	standalone: false
})
export class LoginPageComponent {
	username: string = ""
	password: string = ""
	errorMessage: string = ""

	constructor(
		private router: Router,
		public dataService: DataService,
		private apiService: ApiService,
		private authService: AuthService
	) {}

	ngOnInit() {
		if (this.authService.getAccessToken() != null) {
			// Redirect to tables page
			this.router.navigate(["tables"])
		}
	}

	async login() {
		this.errorMessage = ""

		let loginResponse = await this.apiService.login("uuid", {
			userName: this.username,
			password: this.password
		})

		let accessToken = loginResponse?.data?.login.uuid

		if (accessToken != null) {
			this.authService.setAccessToken(accessToken)
			this.dataService.loadApollo(accessToken)

			// Redirect to tables page
			this.router.navigate(["tables"])
		} else {
			this.errorMessage = "Login failed"
		}
	}
}
