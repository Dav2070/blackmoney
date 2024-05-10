import { Component } from "@angular/core"
import { HttpHeaders } from "@angular/common/http"
import { InMemoryCache } from "@apollo/client/core"
import { Apollo } from "apollo-angular"
import { HttpLink } from "apollo-angular/http"
import { AuthService } from "src/app/services/auth-service"
import { environment } from "src/environments/environment"

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrl: "./app.component.scss"
})
export class AppComponent {
	constructor(
		private apollo: Apollo,
		private httpLink: HttpLink,
		private authService: AuthService
	) {}

	ngOnInit() {
		this.apollo.removeClient()

		this.apollo.create({
			cache: new InMemoryCache(),
			link: this.httpLink.create({
				uri: environment.apiUrl,
				headers: new HttpHeaders().set(
					"Authorization",
					this.authService.getAccessToken()
				)
			})
		})
	}
}
