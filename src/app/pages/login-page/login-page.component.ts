import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { MatIconModule } from "@angular/material/icon"
import { MatButtonModule } from "@angular/material/button"
import { FormsModule } from "@angular/forms"
import { MatInputModule } from "@angular/material/input"
import { MatFormFieldModule } from "@angular/material/form-field"
import { CommonModule } from "@angular/common"

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
	]
})
export class LoginPageComponent {
	username = ""
	password = ""

	showRegistrationForm = false // Diese Variable hinzufügen

	name = "" // Diese Variablen für das Registrierungsformular hinzufügen
	email = ""
	restaurantName = ""
	address = ""
	roomCount = 0

	constructor(private router: Router) {}

	login() {
		this.router.navigate(["tables"])
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
