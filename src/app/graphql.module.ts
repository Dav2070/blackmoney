import { ApolloModule, APOLLO_OPTIONS } from "apollo-angular"
import { HttpLink } from "apollo-angular/http"
import { NgModule } from "@angular/core"
import { InMemoryCache } from "@apollo/client/core"
import { environment } from "../environments/environment"

export function createApollo(httpLink: HttpLink) {
	return {
		cache: new InMemoryCache(),
		link: httpLink.create({
			uri: environment.apiUrl
		})
	}
}

@NgModule({
	exports: [ApolloModule],
	providers: [
		{
			provide: APOLLO_OPTIONS,
			useFactory: createApollo,
			deps: [HttpLink]
		}
	]
})
export class GraphQLModule {}
