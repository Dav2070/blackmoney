import { Injectable } from "@angular/core"
import { HttpHeaders } from "@angular/common/http"
import { InMemoryCache } from "@apollo/client/core"
import { Apollo } from "apollo-angular"
import { HttpLink } from "apollo-angular/http"
import { Dav } from "dav-js"
import { environment } from "src/environments/environment"

@Injectable()
export class DataService {
	dav = Dav

	constructor(private apollo: Apollo, private httpLink: HttpLink) {}

	loadApollo(accessToken: string) {
		this.apollo.removeClient()

		this.apollo.create({
			cache: new InMemoryCache(),
			link: this.httpLink.create({
				uri: environment.apiUrl,
				headers: new HttpHeaders().set("Authorization", accessToken)
			})
		})
	}
}
