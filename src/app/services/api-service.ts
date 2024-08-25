import { Injectable } from "@angular/core"
import { Apollo, gql } from "apollo-angular"
import { ApolloQueryResult, ErrorPolicy } from "@apollo/client/core"
import { List, RoomResource, CategoryResource } from "../types"

const errorPolicy: ErrorPolicy = "all"

@Injectable()
export class ApiService {
	constructor(private apollo: Apollo) {}

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

	async listCategories(
		queryData: string
	): Promise<ApolloQueryResult<{ listCategories: List<CategoryResource> }>> {
		return await this.apollo
			.query<{ listCategories: List<CategoryResource> }>({
				query: gql`
					query ListCategories {
						listCategories {
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
