import { provideNamedApollo } from "apollo-angular"
import { HttpLink } from "apollo-angular/http"
import { inject, NgModule } from "@angular/core"
import { InMemoryCache } from "@apollo/client/core"
import { environment } from "../environments/environment"
import { davAuthClientName, blackmoneyAuthClientName } from "./constants"

export function createApollo() {
	const httpLink = inject(HttpLink)

	return {
		[davAuthClientName]: {
			cache: new InMemoryCache(),
			link: httpLink.create({
				uri: environment.apiUrl
			})
		},
		[blackmoneyAuthClientName]: {
			cache: new InMemoryCache(),
			link: httpLink.create({
				uri: environment.apiUrl
			})
		}
	}
}

@NgModule({
	providers: [provideNamedApollo(createApollo)]
})
export class GraphQLModule {}
