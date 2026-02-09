import { Injectable } from "@angular/core"
import { Apollo, ApolloBase, gql } from "apollo-angular"
import { ErrorPolicy } from "@apollo/client/core"
import {
	List,
	ApolloResult,
	RoomResource,
	CategoryResource,
	CompanyResource,
	TableResource,
	OrderResource,
	UserResource,
	SessionResource,
	PaymentMethod,
	BillResource,
	RestaurantResource,
	RegisterResource,
	RegisterClientResource,
	PrintRuleResource,
	UserRole,
	PrinterResource,
	ProductType,
	PrintRuleType,
	ReservationResource,
	ProductResource,
	OfferResource,
	OfferType,
	DiscountType,
	Weekday,
	AddOrderItemInput
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
			companyUuid: string
			userName: string
			password: string
			registerUuid: string
			registerClientSerialNumber: string
		}
	): Promise<ApolloResult<{ login: SessionResource }>> {
		return await this.davAuthApollo
			.mutate<{ login: SessionResource }>({
				mutation: gql`
					mutation Login(
						$companyUuid: String!
						$userName: String!
						$password: String!
						$registerUuid: String!
						$registerClientSerialNumber: String!
					) {
						login(
							companyUuid: $companyUuid
							userName: $userName
							password: $password
							registerUuid: $registerUuid
							registerClientSerialNumber: $registerClientSerialNumber
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

	async retrieveOwnUser(
		queryData: string
	): Promise<ApolloResult<{ retrieveOwnUser: UserResource }>> {
		return await this.blackmoneyAuthApollo
			.query<{ retrieveOwnUser: UserResource }>({
				query: gql`
					query RetrieveOwnUser {
						retrieveOwnUser {
							${queryData}
						}
					}
				`,
				errorPolicy
			})
			.toPromise()
	}

	async retrieveUser(
		queryData: string,
		variables: { uuid: string }
	): Promise<ApolloResult<{ retrieveUser: UserResource }>> {
		return await this.blackmoneyAuthApollo
			.query<{ retrieveUser: UserResource }>({
				query: gql`
					query RetrieveUser($uuid: String!) {
						retrieveUser(uuid: $uuid) {
							${queryData}
						}
					}
				`,
				variables,
				errorPolicy
			})
			.toPromise()
	}

	async createOwner(
		queryData: string,
		variables: {
			companyUuid: string
			name: string
			password: string
		}
	): Promise<ApolloResult<{ createOwner: UserResource }>> {
		return await this.davAuthApollo
			.mutate<{ createOwner: UserResource }>({
				mutation: gql`
					mutation CreateOwner(
						$companyUuid: String!
						$name: String!
						$password: String!
					) {
						createOwner(
							companyUuid: $companyUuid
							name: $name
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

	async createUser(
		queryData: string,
		variables: {
			companyUuid: string
			name: string
			role?: UserRole
			restaurants: string[]
		}
	): Promise<ApolloResult<{ createUser: UserResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ createUser: UserResource }>({
				mutation: gql`
					mutation CreateUser(
						$companyUuid: String!
						$name: String!
						$role: UserRole
						$restaurants: [String!]!
					) {
						createUser(
							companyUuid: $companyUuid
							name: $name
							role: $role
							restaurants: $restaurants
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

	async setPasswordForUser(
		queryData: string,
		variables: {
			uuid: string
			password: string
		}
	): Promise<ApolloResult<{ setPasswordForUser: UserResource }>> {
		return await this.davAuthApollo
			.mutate<{
				setPasswordForUser: UserResource
			}>({
				mutation: gql`
					mutation SetPasswordForUser(
						$uuid: String!
						$password: String!
					) {
						setPasswordForUser(
							uuid: $uuid
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

	async resetPasswordOfUser(
		queryData: string,
		variables: {
			uuid: string
		}
	): Promise<ApolloResult<{ resetPasswordOfUser: UserResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{
				resetPasswordOfUser: UserResource
			}>({
				mutation: gql`
					mutation ResetPasswordOfUser($uuid: String!) {
						resetPasswordOfUser(uuid: $uuid) {
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
	): Promise<ApolloResult<{ retrieveCompany: CompanyResource }>> {
		return await this.davAuthApollo
			.query<{ retrieveCompany: CompanyResource }>({
				query: gql`
					query RetrieveCompany {
						retrieveCompany {
							${queryData}
						}
					}
				`,
				errorPolicy
			})
			.toPromise()
	}

	async createCompany(
		queryData: string,
		variables: { name: string }
	): Promise<ApolloResult<{ createCompany: CompanyResource }>> {
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

	async retrieveRestaurant(
		queryData: string,
		variables: { uuid: string }
	): Promise<ApolloResult<{ retrieveRestaurant: RestaurantResource }>> {
		return await this.davAuthApollo
			.query<{
				retrieveRestaurant: RestaurantResource
			}>({
				query: gql`
					query RetrieveRestaurant($uuid: String!) {
						retrieveRestaurant(uuid: $uuid) {
							${queryData}
						}
					}
				`,
				variables,
				errorPolicy
			})
			.toPromise()
	}

	async updateRestaurant(
		queryData: string,
		variables: {
			uuid: string
			name?: string
			city?: string
			country?: string
			line1?: string
			houseNumber?: string
			line2?: string
			postalCode?: string
			owner?: string
			taxNumber?: string
			mail?: string
			phoneNumber?: string
		}
	): Promise<ApolloResult<{ updateRestaurant: RestaurantResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ updateRestaurant: RestaurantResource }>({
				mutation: gql`
					mutation UpdateRestaurant(
						$uuid: String!
						$name: String
						$city: String
						$country: Country
						$line1: String
						$houseNumber: String
						$line2: String
						$postalCode: String
						$owner: String
						$taxNumber: String
						$mail: String
						$phoneNumber: String
					) {
						updateRestaurant(
							uuid: $uuid
							name: $name
							city: $city
							country: $country
							line1: $line1
							houseNumber: $houseNumber
							line2: $line2
							postalCode: $postalCode
							owner: $owner
							taxNumber: $taxNumber
							mail: $mail
							phoneNumber: $phoneNumber
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

	async retrieveRegister(
		queryData: string,
		variables: { uuid: string }
	): Promise<ApolloResult<{ retrieveRegister: RegisterResource }>> {
		return await this.blackmoneyAuthApollo
			.query<{ retrieveRegister: RegisterResource }>({
				query: gql`
					query RetrieveRegister($uuid: String!) {
						retrieveRegister(uuid: $uuid) {
							${queryData}
						}
					}
				`,
				variables,
				errorPolicy
			})
			.toPromise()
	}

	async createRegister(
		queryData: string,
		variables: {
			restaurantUuid: string
			name: string
		}
	): Promise<ApolloResult<{ createRegister: RegisterResource }>> {
		return await this.davAuthApollo
			.mutate<{
				createRegister: RegisterResource
			}>({
				mutation: gql`
					mutation CreateRegister(
						$restaurantUuid: String!
						$name: String!
					) {
						createRegister(
							restaurantUuid: $restaurantUuid
							name: $name
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

	async activateRegister(
		queryData: string,
		variables: {
			uuid: string
		}
	): Promise<ApolloResult<{ activateRegister: RegisterResource }>> {
		return await this.davAuthApollo
			.mutate<{ activateRegister: RegisterResource }>({
				mutation: gql`
					mutation ActivateRegister($uuid: String!) {
						activateRegister(uuid: $uuid) {
							${queryData}
						}
					}
				`,
				variables,
				errorPolicy
			})
			.toPromise()
	}

	async retrieveRegisterClient(
		queryData: string,
		variables: { uuid: string }
	): Promise<
		ApolloResult<{ retrieveRegisterClient: RegisterClientResource }>
	> {
		return await this.blackmoneyAuthApollo
			.query<{ retrieveRegisterClient: RegisterClientResource }>({
				query: gql`
					query RetrieveRegisterClient($uuid: String!) {
						retrieveRegisterClient(uuid: $uuid) {
							${queryData}
						}
					}
				`,
				variables,
				errorPolicy
			})
			.toPromise()
	}

	async retrieveRegisterClientBySerialNumber(
		queryData: string,
		variables: {
			registerUuid: string
			serialNumber: string
		}
	): Promise<
		ApolloResult<{
			retrieveRegisterClientBySerialNumber: RegisterClientResource
		}>
	> {
		return await this.blackmoneyAuthApollo
			.query<{
				retrieveRegisterClientBySerialNumber: RegisterClientResource
			}>({
				query: gql`
					query RetrieveRegisterClientBySerialNumber(
						$registerUuid: String!
						$serialNumber: String!
					) {
						retrieveRegisterClientBySerialNumber(
							registerUuid: $registerUuid
							serialNumber: $serialNumber
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

	async updateRegisterClient(
		queryData: string,
		variables: {
			uuid: string
			name?: string
		}
	): Promise<ApolloResult<{ updateRegisterClient: RegisterClientResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{
				updateRegisterClient: RegisterClientResource
			}>({
				mutation: gql`
					mutation UpdateRegisterClient(
						$uuid: String!
						$name: String
					) {
						updateRegisterClient(
							uuid: $uuid
							name: $name
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

	async searchPrinters(
		queryData: string,
		variables: {
			restaurantUuid: string
			query: string
			exclude?: string[]
		}
	): Promise<ApolloResult<{ searchPrinters: List<PrinterResource> }>> {
		return await this.blackmoneyAuthApollo
			.query<{ searchPrinters: List<PrinterResource> }>({
				query: gql`
					query SearchPrinters(
						$restaurantUuid: String!
						$query: String!
						$exclude: [String!]
					) {
						searchPrinters(
							restaurantUuid: $restaurantUuid
							query: $query
							exclude: $exclude
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

	async createPrinter(
		queryData: string,
		variables: {
			restaurantUuid: string
			name: string
			ipAddress: string
		}
	): Promise<ApolloResult<{ createPrinter: PrinterResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{
				createPrinter: PrinterResource
			}>({
				mutation: gql`
					mutation CreatePrinter(
						$restaurantUuid: String!
						$name: String!
						$ipAddress: String!
					) {
						createPrinter(
							restaurantUuid: $restaurantUuid
							name: $name
							ipAddress: $ipAddress
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

	async updatePrinter(
		queryData: string,
		variables: {
			uuid: string
			name: string
			ipAddress: string
		}
	): Promise<ApolloResult<{ updatePrinter: PrinterResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ updatePrinter: PrinterResource }>({
				mutation: gql`
					mutation UpdatePrinter(
						$uuid: String!
						$name: String!
						$ipAddress: String!
					) {
						updatePrinter(
							uuid: $uuid
							name: $name
							ipAddress: $ipAddress
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

	async createPrintRule(
		queryData: string,
		variables: {
			registerClientUuid: string
			type: PrintRuleType
			productType?: ProductType
			printerUuids: string[]
			categoryUuids?: string[]
			productUuids?: string[]
		}
	): Promise<
		ApolloResult<{
			createPrintRule: PrintRuleResource
		}>
	> {
		return await this.blackmoneyAuthApollo
			.mutate<{
				createPrintRule: PrintRuleResource
			}>({
				mutation: gql`
					mutation CreatePrintRule(
						$registerClientUuid: String!
						$type: PrintRuleType!
						$productType: ProductType
						$printerUuids: [String!]!
						$categoryUuids: [String!]
						$productUuids: [String!]
					) {
						createPrintRule(
							registerClientUuid: $registerClientUuid
							type: $type
							productType: $productType
							printerUuids: $printerUuids
							categoryUuids: $categoryUuids
							productUuids: $productUuids
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

	async updatePrintRule(
		queryData: string,
		variables: {
			uuid: string
			printerUuids: string[]
			categoryUuids?: string[]
			productUuids?: string[]
		}
	): Promise<ApolloResult<{ updatePrintRule: PrintRuleResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ updatePrintRule: PrintRuleResource }>({
				mutation: gql`
					mutation UpdatePrintRule(
						$uuid: String!
						$printerUuids: [String!]!
						$categoryUuids: [String!]
						$productUuids: [String!]
					) {
						updatePrintRule(
							uuid: $uuid
							printerUuids: $printerUuids
							categoryUuids: $categoryUuids
							productUuids: $productUuids
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

	async deletePrintRule(
		queryData: string,
		variables: { uuid: string }
	): Promise<ApolloResult<{ deletePrintRule: PrintRuleResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ deletePrintRule: PrintRuleResource }>({
				mutation: gql`
					mutation DeletePrintRule($uuid: String!) {
						deletePrintRule(uuid: $uuid) {
							${queryData}
						}
					}
				`,
				variables,
				errorPolicy
			})
			.toPromise()
	}

	async retrieveRoom(
		queryData: string,
		variables: {
			uuid: string
		}
	): Promise<ApolloResult<{ retrieveRoom: RoomResource }>> {
		return await this.blackmoneyAuthApollo
			.query<{ retrieveRoom: RoomResource }>({
				query: gql`
					query RetrieveRoom($uuid: String!) {
						retrieveRoom(uuid: $uuid) {
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
		queryData: string,
		variables: {
			restaurantUuid: string
		}
	): Promise<ApolloResult<{ listRooms: List<RoomResource> }>> {
		return await this.blackmoneyAuthApollo
			.query<{ listRooms: List<RoomResource> }>({
				query: gql`
					query ListRooms($restaurantUuid: String!) {
						listRooms(restaurantUuid: $restaurantUuid) {
							${queryData}
						}
					}
				`,
				variables,
				errorPolicy
			})
			.toPromise()
	}

	async createRoom(
		queryData: string,
		variables: { restaurantUuid: string; name: string }
	): Promise<ApolloResult<{ createRoom: RoomResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ createRoom: RoomResource }>({
				mutation: gql`
					mutation CreateRoom(
						$restaurantUuid: String!
						$name: String!
					) {
						createRoom(
							restaurantUuid: $restaurantUuid
							name: $name
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

	async updateRoom(
		queryData: string,
		variables: { uuid: string; name: string }
	): Promise<ApolloResult<{ updateRoom: RoomResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ updateRoom: RoomResource }>({
				mutation: gql`
					mutation UpdateRoom(
						$uuid: String!
						$name: String
					) {
						updateRoom(
							uuid: $uuid
							name: $name
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

	async deleteRoom(
		queryData: string,
		variables: { uuid: string }
	): Promise<ApolloResult<{ deleteRoom: RoomResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ deleteRoom: RoomResource }>({
				mutation: gql`
					mutation DeleteRoom($uuid: String!) {
						deleteRoom(uuid: $uuid) {
							${queryData}
						}
					}
				`,
				variables,
				errorPolicy
			})
			.toPromise()
	}

	async createTable(
		queryData: string,
		variables: { roomUuid: string; name: number; seats: number }
	): Promise<ApolloResult<{ createTable: TableResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ createTable: TableResource }>({
				mutation: gql`
					mutation CreateTable(
						$roomUuid: String!
						$name: Int!
						$seats: Int!
					) {
						createTable(
							roomUuid: $roomUuid
							name: $name
							seats: $seats
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

	async updateTable(
		queryData: string,
		variables: { uuid: string; seats?: number }
	): Promise<ApolloResult<{ updateTable: TableResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ updateTable: TableResource }>({
				mutation: gql`
					mutation UpdateTable(
						$uuid: String!
						$seats: Int
					) {
						updateTable(
							uuid: $uuid
							seats: $seats
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

	async deleteTable(
		queryData: string,
		variables: { uuid: string }
	): Promise<ApolloResult<{ deleteTable: TableResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ deleteTable: TableResource }>({
				mutation: gql`
					mutation DeleteTable($uuid: String!) {
						deleteTable(uuid: $uuid) {
							${queryData}
						}
					}
				`,
				variables,
				errorPolicy
			})
			.toPromise()
	}

	async retrieveCategory(
		queryData: string,
		variables: { uuid: string; type?: ProductType }
	): Promise<ApolloResult<{ retrieveCategory: CategoryResource }>> {
		const typeParam = queryData.includes("products")
			? "$type: ProductType"
			: ""

		return await this.blackmoneyAuthApollo
			.query<{ retrieveCategory: CategoryResource }>({
				query: gql`
					query RetrieveCategory(
						$uuid: String!
						${typeParam}
					) {
						retrieveCategory(uuid: $uuid) {
							${queryData}
						}
					}
				`,
				variables,
				errorPolicy,
				fetchPolicy: "network-only"
			})
			.toPromise()
	}

	async searchCategories(
		queryData: string,
		variables: {
			restaurantUuid: string
			query: string
			exclude?: string[]
		}
	): Promise<ApolloResult<{ searchCategories: List<CategoryResource> }>> {
		return await this.blackmoneyAuthApollo
			.query<{ searchCategories: List<CategoryResource> }>({
				query: gql`
					query SearchCategories(
						$restaurantUuid: String!
						$query: String!
						$exclude: [String!]
					) {
						searchCategories(
							restaurantUuid: $restaurantUuid
							query: $query
							exclude: $exclude
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

	async listCategories(
		queryData: string,
		variables: {
			restaurantUuid: string
		}
	): Promise<ApolloResult<{ listCategories: List<CategoryResource> }>> {
		return await this.blackmoneyAuthApollo
			.query<{ listCategories: List<CategoryResource> }>({
				query: gql`
					query ListCategories($restaurantUuid: String!) {
						listCategories(restaurantUuid: $restaurantUuid) {
							${queryData}
						}
					}
				`,
				variables,
				errorPolicy
			})
			.toPromise()
	}

	async createCategory(
		queryData: string,
		variables: {
			restaurantUuid: string
			name: string
		}
	): Promise<ApolloResult<{ createCategory: CategoryResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ createCategory: CategoryResource }>({
				mutation: gql`
					mutation CreateCategory(
						$restaurantUuid: String!
						$name: String!
					) {
						createCategory(
							restaurantUuid: $restaurantUuid
							name: $name
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

	async updateCategory(
		queryData: string,
		variables: {
			uuid: string
			name?: string
		}
	): Promise<ApolloResult<{ updateCategory: CategoryResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ updateCategory: CategoryResource }>({
				mutation: gql`
					mutation UpdateCategory(
						$uuid: String!
						$name: String
					) {
						updateCategory(
							uuid: $uuid
							name: $name
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

	async deleteCategory(
		queryData: string,
		variables: { uuid: string }
	): Promise<ApolloResult<{ deleteCategory: CategoryResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ deleteCategory: CategoryResource }>({
				mutation: gql`
					mutation DeleteCategory($uuid: String!) {
						deleteCategory(uuid: $uuid) {
							${queryData}
						}
					}
				`,
				variables,
				errorPolicy
			})
			.toPromise()
	}

	async createProduct(
		queryData: string,
		variables: {
			categoryUuid: string
			name: string
			price: number
			type: ProductType
			shortcut?: number
			variationUuids?: string[]
		}
	): Promise<ApolloResult<{ createProduct: ProductResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ createProduct: ProductResource }>({
				mutation: gql`
					mutation CreateProduct(
						$categoryUuid: String!
						$name: String!
						$price: Int!
						$type: ProductType!
						$shortcut: Int
						$variationUuids: [String!]
					) {
						createProduct(
							categoryUuid: $categoryUuid
							name: $name
							price: $price
							type: $type
							shortcut: $shortcut
							variationUuids: $variationUuids
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

	async updateProduct(
		queryData: string,
		variables: {
			uuid: string
			name?: string
			price?: number
			shortcut?: number
			variationUuids?: string[]
		}
	): Promise<ApolloResult<{ updateProduct: ProductResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ updateProduct: ProductResource }>({
				mutation: gql`
					mutation UpdateProduct(
						$uuid: String!
						$name: String
						$price: Int
						$shortcut: Int
						$variationUuids: [String!]
					) {
						updateProduct(
							uuid: $uuid
							name: $name
							price: $price
							shortcut: $shortcut
							variationUuids: $variationUuids
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

	async deleteProduct(
		queryData: string,
		variables: { uuid: string }
	): Promise<ApolloResult<{ deleteProduct: ProductResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ deleteProduct: ProductResource }>({
				mutation: gql`
					mutation DeleteProduct($uuid: String!) {
						deleteProduct(uuid: $uuid) {
							${queryData}
						}
					}
				`,
				variables,
				errorPolicy
			})
			.toPromise()
	}

	async createOffer(
		queryData: string,
		variables: {
			productUuid: string
			offerType: OfferType
			discountType?: DiscountType
			offerValue: number
			startDate?: string
			endDate?: string
			startTime?: string
			endTime?: string
			weekdays: Weekday[]
			offerItems: {
				name: string
				maxSelections: number
				productUuids: string[]
			}[]
		}
	): Promise<ApolloResult<{ createOffer: OfferResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ createOffer: OfferResource }>({
				mutation: gql`
					mutation CreateOffer(
						$productUuid: String!
						$offerType: OfferType!
						$discountType: DiscountType
						$offerValue: Int!
						$startDate: String
						$endDate: String
						$startTime: String
						$endTime: String
						$weekdays: [Weekday!]!
						$offerItems: [OfferItemInput!]!
					) {
						createOffer(
							productUuid: $productUuid
							offerType: $offerType
							discountType: $discountType
							offerValue: $offerValue
							startDate: $startDate
							endDate: $endDate
							startTime: $startTime
							endTime: $endTime
							weekdays: $weekdays
							offerItems: $offerItems
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

	async updateOffer(
		queryData: string,
		variables: {
			uuid: string
			offerType?: OfferType
			discountType?: DiscountType
			offerValue?: number
			startDate?: string
			endDate?: string
			startTime?: string
			endTime?: string
			weekdays?: Weekday[]
			offerItems?: {
				name: string
				maxSelections: number
				productUuids: string[]
			}[]
		}
	): Promise<ApolloResult<{ updateOffer: OfferResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ updateOffer: OfferResource }>({
				mutation: gql`
					mutation UpdateOffer(
						$uuid: String!
						$offerType: OfferType
						$discountType: DiscountType
						$offerValue: Int
						$startDate: String
						$endDate: String
						$startTime: String
						$endTime: String
						$weekdays: [Weekday!]
						$offerItems: [OfferItemInput!]
					) {
						updateOffer(
							uuid: $uuid
							offerType: $offerType
							discountType: $discountType
							offerValue: $offerValue
							startDate: $startDate
							endDate: $endDate
							startTime: $startTime
							endTime: $endTime
							weekdays: $weekdays
							offerItems: $offerItems
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

	async deleteOffer(
		queryData: string,
		variables: { uuid: string }
	): Promise<ApolloResult<{ deleteOffer: OfferResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ deleteOffer: OfferResource }>({
				mutation: gql`
					mutation DeleteOffer($uuid: String!) {
						deleteOffer(uuid: $uuid) {
							${queryData}
						}
					}
				`,
				variables,
				errorPolicy
			})
			.toPromise()
	}

	async searchProducts(
		queryData: string,
		variables: {
			restaurantUuid: string
			query: string
			exclude?: string[]
		}
	): Promise<ApolloResult<{ searchProducts: List<CategoryResource> }>> {
		return await this.blackmoneyAuthApollo
			.query<{ searchProducts: List<CategoryResource> }>({
				query: gql`
					query SearchProducts(
						$restaurantUuid: String!
						$query: String!
						$exclude: [String!]
					) {
						searchProducts(
							restaurantUuid: $restaurantUuid
							query: $query
							exclude: $exclude
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

	async retrieveTable(
		queryData: string,
		variables: { uuid: string; paid?: boolean }
	): Promise<ApolloResult<{ retrieveTable: TableResource }>> {
		const paidParam = queryData.includes("paid") ? "$paid: Boolean" : ""

		return await this.blackmoneyAuthApollo
			.query<{ retrieveTable: TableResource }>({
				query: gql`
					query retrieveTable(
						$uuid:String!
						${paidParam}
					) {
						retrieveTable(uuid: $uuid) {
							${queryData}
						}
					}
				`,
				variables,
				errorPolicy
			})
			.toPromise()
	}

	async updateOrder(
		queryData: string,
		variables: {
			uuid: string
			orderItems: {
				count: number
				productId: number
				orderItemVariations: {
					count: number
					variationItems: {
						id: number
					}[]
				}[]
			}[]
		}
	): Promise<ApolloResult<{ updateOrder: OrderResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ updateOrder: OrderResource }>({
				mutation: gql`
					mutation UpdateOrder(
						$uuid: String!
						$orderItems: [OrderItemInput!]!
					) {
						updateOrder(
							uuid: $uuid
							orderItems: $orderItems
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

	async addProductsToOrder(
		queryData: string,
		variables: {
			uuid: string
			products: AddOrderItemInput[]
		}
	): Promise<ApolloResult<{ addProductsToOrder: OrderResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ addProductsToOrder: OrderResource }>({
				mutation: gql`
					mutation AddProductsToOrder(
						$uuid: String!
						$products: [AddOrderItemInput!]!
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
			products: AddOrderItemInput[]
		}
	): Promise<ApolloResult<{ removeProductsFromOrder: OrderResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ removeProductsFromOrder: OrderResource }>({
				mutation: gql`
					mutation RemoveProductsFromOrder(
						$uuid: String!
						$products: [AddOrderItemInput!]!
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

	async updateOrderItem(
		queryData: string,
		variables: {
			uuid: string
			count: number
			orderItemVariations: {
				uuid: string
				count: number
			}[]
		}
	): Promise<ApolloResult<{ updateOrderItem: OrderResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ updateOrderItem: OrderResource }>({
				mutation: gql`
					mutation UpdateOrderItem(
						$uuid: String!
						$count: Int
						$orderItemVariations: [OrderItemVariationInput!]
					) {
						updateOrderItem(
							uuid: $uuid
							count: $count
							orderItemVariations: $orderItemVariations
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

	async completeOrder(
		queryData: string,
		variables: {
			uuid: string
			billUuid: string
			paymentMethod: PaymentMethod
		}
	): Promise<ApolloResult<{ completeOrder: OrderResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ completeOrder: OrderResource }>({
				mutation: gql`
					mutation CompleteOrder(
						$uuid: String!
						$billUuid: String!
						$paymentMethod: PaymentMethod!
					) {
						completeOrder(
							uuid: $uuid
							billUuid: $billUuid
							paymentMethod: $paymentMethod
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

	async listOrders(
		queryData: string,
		variables: { completed?: boolean }
	): Promise<ApolloResult<{ listOrders: List<OrderResource> }>> {
		return await this.blackmoneyAuthApollo
			.query<{ listOrders: List<OrderResource> }>({
				query: gql`
					query ListOrders($completed:Boolean) {
						listOrders(completed:$completed) {
							${queryData}
						}
					}
				`,
				variables,
				errorPolicy
			})
			.toPromise()
	}

	async createOrder(
		queryData: string,
		variables: { tableUuid: string }
	): Promise<ApolloResult<{ createOrder: OrderResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ createOrder: OrderResource }>({
				mutation: gql`
					mutation CreateOrder(
						$tableUuid: String!
					) {
						createOrder(
							tableUuid: $tableUuid
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

	async createBill(
		queryData: string,
		variables: { registerClientUuid: string }
	): Promise<ApolloResult<{ createBill: BillResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ createBill: BillResource }>({
				mutation: gql`
					mutation CreateBill($registerClientUuid: String!) {
						createBill(registerClientUuid: $registerClientUuid) {
							${queryData}
						}
					}
				`,
				variables,
				errorPolicy
			})
			.toPromise()
	}

	async listReservations(
		queryData: string,
		variables: {
			restaurantUuid: string
			date: string
		}
	): Promise<ApolloResult<{ listReservations: List<ReservationResource> }>> {
		return await this.blackmoneyAuthApollo
			.query<{ listReservations: List<ReservationResource> }>({
				query: gql`
					query ListReservations(
						$restaurantUuid: String!
						$date: String!
					) {
						listReservations(
							restaurantUuid: $restaurantUuid
							date: $date
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

	async updateReservation(
		queryData: string,
		variables: {
			uuid: string
			checkedIn?: boolean
		}
	): Promise<ApolloResult<{ updateReservation: ReservationResource }>> {
		return await this.blackmoneyAuthApollo
			.mutate<{ updateReservation: ReservationResource }>({
				mutation: gql`
					mutation UpdateReservation(
						$uuid: String!
						$checkedIn: Boolean
					) {
						updateReservation(
							uuid: $uuid
							checkedIn: $checkedIn
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

	async createStripeAccountOnboardingLink(
		queryData: string,
		variables: {
			refreshUrl: string
			returnUrl: string
		}
	): Promise<
		ApolloResult<{ createStripeAccountOnboardingLink: { url: string } }>
	> {
		return await this.blackmoneyAuthApollo
			.mutate<{ createStripeAccountOnboardingLink: { url: string } }>({
				mutation: gql`
					mutation CreateStripeAccountOnboardingLink(
						$refreshUrl: String!
						$returnUrl: String!
					) {
						createStripeAccountOnboardingLink(
							refreshUrl: $refreshUrl
							returnUrl: $returnUrl
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

	async createStripeBillingPortalSession(
		queryData: string,
		variables: {
			returnUrl: string
		}
	): Promise<
		ApolloResult<{ createStripeBillingPortalSession: { url: string } }>
	> {
		return await this.blackmoneyAuthApollo
			.mutate<{
				createStripeBillingPortalSession: { url: string }
			}>({
				mutation: gql`
					mutation CreateStripeBillingPortalSession($returnUrl: String!) {
						createStripeBillingPortalSession(returnUrl: $returnUrl) {
							${queryData}
						}
					}
				`,
				errorPolicy,
				variables
			})
			.toPromise()
	}

	async createStripeSubscriptionCheckoutSession(
		queryData: string,
		variables: {
			successUrl: string
			cancelUrl: string
		}
	): Promise<
		ApolloResult<{ createStripeSubscriptionCheckoutSession: { url: string } }>
	> {
		return await this.blackmoneyAuthApollo
			.mutate<{
				createStripeSubscriptionCheckoutSession: { url: string }
			}>({
				mutation: gql`
					mutation CreateStripeSubscriptionCheckoutSession(
						$successUrl: String!
						$cancelUrl: String!
					) {
						createStripeSubscriptionCheckoutSession(
							successUrl: $successUrl
							cancelUrl: $cancelUrl
						) {
							${queryData}
						}
					}
				`,
				errorPolicy,
				variables
			})
			.toPromise()
	}

	async createStripeConnectionToken(queryData: string): Promise<
		ApolloResult<{
			createStripeConnectionToken: { secret: string }
		}>
	> {
		return await this.blackmoneyAuthApollo
			.mutate<{
				createStripeConnectionToken: { secret: string }
			}>({
				mutation: gql`
					mutation CreateStripeConnectionToken {
						createStripeConnectionToken {
							${queryData}
						}
					}
				`,
				errorPolicy
			})
			.toPromise()
	}

	async captureStripePaymentIntent(
		queryData: string,
		variables: { id: string }
	): Promise<
		ApolloResult<{
			captureStripePaymentIntent: { id: string }
		}>
	> {
		return await this.blackmoneyAuthApollo
			.mutate<{
				captureStripePaymentIntent: { id: string }
			}>({
				mutation: gql`
					mutation CaptureStripePaymentIntent($id: String!) {
						captureStripePaymentIntent(id: $id) {
							${queryData}
						}
					}
				`,
				errorPolicy,
				variables
			})
			.toPromise()
	}
}
