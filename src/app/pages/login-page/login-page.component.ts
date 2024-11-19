import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { ApiService } from "src/app/services/api-service"
import { AuthService } from "src/app/services/auth-service"
import { DataService } from "src/app/services/data-service"

@Component({
	templateUrl: "./login-page.component.html",
	styleUrl: "./login-page.component.scss"
})
export class LoginPageComponent {
	username = ""
	password = ""

	showRegistrationForm = false

	name = ""
	email = ""
	restaurantName = ""
	address = ""
	roomCount = 0

	constructor(
		private router: Router,
		private apiService: ApiService,
		private authService: AuthService,
		private dataService: DataService
	) {}

	ngOnInit() {
		if (this.authService.getAccessToken() != null) {
			// Redirect to tables page
			this.router.navigate(["tables"])
		}
	}

	async login() {
		let result = await this.apiService.login("uuid", {
			userName: this.username,
			password: this.password
		})

		let token = result?.data?.login.uuid

		if (token != null) {
			this.authService.setAccessToken(token)
			this.dataService.loadApollo(token)

			// Redirect to tables page
			this.router.navigate(["tables"])
		}
	}

	register() {
		// Hier implementieren Sie Ihre Registrierungslogik
		// Zum Beispiel, Sie könnten eine HTTP-Anfrage an Ihren Server senden, um den Benutzer zu registrieren
		// Wenn die Registrierung erfolgreich ist, könnten Sie den Benutzer weiterleiten oder eine Erfolgsmeldung anzeigen
	}

	cancelRegistration() {
		this.showRegistrationForm = false
		// Optional: Zurücksetzen der Registrierungsformulardaten
		this.name = ""
		this.email = ""
		this.restaurantName = ""
		this.address = ""
		this.roomCount = 0
	}
}
