import { Injectable } from "@angular/core"
import { Apollo, ApolloBase, gql, MutationResult } from "apollo-angular"
import { ApolloQueryResult, ErrorPolicy } from "@apollo/client/core"
import {
	List,
	RoomResource,
	CategoryResource,
	CompanyResource,
	TableResource,
	OrderResource
} from "../types"
import { davAuthClientName, blackmoneyAuthClientName } from "../constants"

const errorPolicy: ErrorPolicy = "all"

@Injectable()
export class ApiService {
	private davAuthApollo: ApolloBase
	private blackmoneyAuthApollo: ApolloBase

	constructor(private apolloProvider: Apollo) {
		this.loadApolloClients()
	}

	loadApolloClients() {
		this.davAuthApollo = this.apolloProvider.use(davAuthClientName)
		this.blackmoneyAuthApollo = this.apolloProvider.use(
			blackmoneyAuthClientName
		)
	}

	async login(
		queryData: string,
		variables: {
			userName: string
			password: string
		}
	): Promise<MutationResult<{ login: { uuid: string } }>> {
		return await this.davAuthApollo
			.mutate<{ login: { uuid: string } }>({
				mutation: gql`
					mutation Login(
						$userName: String!
						$password: String!
					) {
						login(
							userName: $userName
							password: $password
						) {
							${queryData}
						}
					}
				`,
				variables,
				errorPolicy
			})
			.toPromise()
	}

	async retrieveCompany(
		queryData: string
	): Promise<ApolloQueryResult<{ retrieveCompany: CompanyResource }>> {
		return await this.davAuthApollo
			.query<{ retrieveCompany: CompanyResource }>({
				query: gql`
					query RetrieveCompany {
						retrieveCompany {
							${queryData}
						}
					}
				`,
				variables: {},
				errorPolicy
			})
			.toPromise()
	}

	async createCompany(
		queryData: string,
		variables: { name: string }
	): Promise<MutationResult<{ createCompany: CompanyResource }>> {
		return await this.davAuthApollo
			.mutate<{ createCompany: CompanyResource }>({
				mutation: gql`
					mutation CreateCompany($name: String!) {
						createCompany(name: $name) {
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
		return await this.blackmoneyAuthApollo
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
		return await this.blackmoneyAuthApollo
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

	async retrieveTable(
		queryData: string,
		variables: { uuid: string; paid?: boolean }
	): Promise<ApolloQueryResult<{ retrieveTable: TableResource }>> {
		let paidParam = queryData.includes("paid") ? "$paid: Boolean" : ""

		return await this.blackmoneyAuthApollo
			.query<{ retrieveTable: TableResource }>({
				query: gql`
					query retrieveTable($uuid:String!,${paidParam}) {
						retrieveTable(uuid:$uuid) {
							${queryData}
						}
					}
				`,
				variables,
				errorPolicy
			})
			.toPromise()
	}

	async addProductsToOrder(
		queryData: string,
		variables: {
			uuid: string
			products: {
				uuid: string
				count: number
				variations?: {
					variationItemUuids: string[]
					count: number
				}[]
			}[]
		}
	): Promise<MutationResult<{ addProductsToOrder: OrderResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ addProductsToOrder: OrderResource }>({
				mutation: gql`
					mutation AddProductsToOrder(
						$uuid: String!
						$products: [AddProductsInput!]!
					) {
						addProductsToOrder(
							uuid: $uuid
							products: $products
						) {
							${queryData}
						}
					}
				`,
				variables,
				errorPolicy
			})
			.toPromise()
	}

	async removeProductsFromOrder(
		queryData: string,
		variables: {
			uuid: string
			products: {
				uuid: string
				count: number
			}[]
		}
	): Promise<MutationResult<{ removeProductsFromOrder: OrderResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ removeProductsFromOrder: OrderResource }>({
				mutation: gql`
					mutation RemoveProductsFromOrder(
						$uuid: String!
						$products: [AddProductsInput!]!
					) {
						removeProductsFromOrder(
							uuid: $uuid
							products: $products
						) {
							${queryData}
						}
					}
				`,
				variables,
				errorPolicy
			})
			.toPromise()
	}
}
