import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { MatIconModule } from "@angular/material/icon"
import { MatButtonModule } from "@angular/material/button"
import { FormsModule } from "@angular/forms"
import { MatInputModule } from "@angular/material/input"
import { MatFormFieldModule } from "@angular/material/form-field"
import { CommonModule } from "@angular/common"
import { ApiService } from "src/app/services/api-service"

@Component({
	templateUrl: "./login-page.component.html",
	styleUrl: "./login-page.component.scss",
	standalone: true,
	imports: [
		MatFormFieldModule,
		MatInputModule,
		FormsModule,
		MatButtonModule,
		MatIconModule,
		CommonModule
	],
	providers: [ApiService]
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

	constructor(private router: Router, private apiService: ApiService) {}

	async login() {
		let result = await this.apiService.createSession("token", {
			username: this.username,
			password: this.password
		})

		if (result?.data?.createSession.token != null) {
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
