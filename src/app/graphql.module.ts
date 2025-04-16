import { ApolloModule, APOLLO_NAMED_OPTIONS } from "apollo-angular"
import { HttpLink } from "apollo-angular/http"
import { NgModule } from "@angular/core"
import { InMemoryCache } from "@apollo/client/core"
import { environment } from "../environments/environment"
import { davAuthClientName, blackmoneyAuthClientName } from "./constants"

export function createApollo(httpLink: HttpLink) {
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
	exports: [ApolloModule],
	providers: [
		{
			provide: APOLLO_NAMED_OPTIONS,
			useFactory: createApollo,
			deps: [HttpLink]
		}
	]
})
export class GraphQLModule {}
