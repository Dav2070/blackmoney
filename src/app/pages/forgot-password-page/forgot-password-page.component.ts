import { Component } from "@angular/core"
import { Router } from "@angular/router"

@Component({
	templateUrl: "./forgot-password-page.component.html",
	styleUrl: "./forgot-password-page.component.scss"
})
export class ForgotPasswordPageComponent {
	email = ""

	constructor(private router: Router) {}

	PasswortVergessen() {
		this.router.navigate(["tables"])
	}
}
