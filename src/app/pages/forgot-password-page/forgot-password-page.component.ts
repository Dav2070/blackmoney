import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { MatIconModule } from "@angular/material/icon"
import { MatButtonModule } from "@angular/material/button"
import { FormsModule } from "@angular/forms"
import { MatInputModule } from "@angular/material/input"
import { MatFormFieldModule } from "@angular/material/form-field"
import { CommonModule } from '@angular/common';

@Component({
	templateUrl: "./forgot-password-page.component.html",
	styleUrl: "./forgot-password-page.component.scss",
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
export class ForgotPasswordPageComponent {

	email = "";

	constructor(private router: Router) {}

	PasswortVergessen() {
		this.router.navigate(["tables"])
	}

}
