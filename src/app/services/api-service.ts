import { Injectable } from "@angular/core"
import { Apollo, MutationResult, gql } from "apollo-angular"
import { ApolloQueryResult, ErrorPolicy } from "@apollo/client/core"
import { List, SessionResource, RoomResource } from "../types"

const errorPolicy: ErrorPolicy = "all"

@Injectable()
export class ApiService {
	constructor(private apollo: Apollo) {}

	async createSession(
		queryData: string,
		variables: {
			username: string
			password: string
		}
	): Promise<MutationResult<{ createSession: SessionResource }> | undefined> {
		return await this.apollo
			.mutate<{ createSession: SessionResource }>({
				mutation: gql`
					mutation CreateSession($username: String!, $password: String!) {
						createSession(username: $username, password: $password) {
							${queryData}
						}
					}
				`,
				variables,
				errorPolicy
			})
			.toPromise()
	}

	async listRooms(
		queryData: string
	): Promise<ApolloQueryResult<{ listRooms: List<RoomResource> }>> {
		return await this.apollo
			.query<{ listRooms: List<RoomResource> }>({
				query: gql`
					query ListRooms {
						listRooms {
							${queryData}
						}
					}
				`,
				variables: {},
				errorPolicy
			})
			.toPromise()
	}
}
