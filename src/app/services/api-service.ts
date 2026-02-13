import { Injectable } from "@angular/core"
import { Apollo, ApolloBase, gql } from "apollo-angular"
import { ErrorPolicy, TypedDocumentNode } from "@apollo/client/core"
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
	private refetchQueries: string[] = []

	constructor(private apolloProvider: Apollo) {
		this.loadApolloClients()
	}

	loadApolloClients() {
		this.davAuthApollo = this.apolloProvider.use(davAuthClientName)
		this.blackmoneyAuthApollo = this.apolloProvider.use(
			blackmoneyAuthClientName
		)
	}

	addRefetchQuery(...functions: Function[]) {
		for (const func of functions) {
			const name = func.name.toLowerCase()

			if (!this.refetchQueries.includes(name)) {
				this.refetchQueries.push(name)
			}
		}
	}

	private async query<Result>(args: {
		apollo: ApolloBase
		query: TypedDocumentNode<Result>
		variables?: object
	}): Promise<ApolloResult<Result>> {
		let queryName = null

		if (
			args.query.kind === "Document" &&
			args.query.definitions.length > 0 &&
			args.query.definitions[0].kind === "OperationDefinition"
		) {
			queryName =
				args.query.definitions[0].name?.value?.toLowerCase() ?? null
		}

		const refetch =
			queryName != null && this.refetchQueries.includes(queryName)

		const response = await args.apollo
			.query<Result>({
				query: args.query,
				variables: args.variables,
				errorPolicy,
				fetchPolicy: refetch ? "network-only" : null
			})
			.toPromise()

		if (refetch && response.error == null) {
			const i = this.refetchQueries.indexOf(queryName)
			if (i != -1) this.refetchQueries.splice(i, 1)
		}

		return response
	}

	private async mutate<Result>(args: {
		apollo: ApolloBase
		mutation: TypedDocumentNode<Result>
		variables?: object
		refetchQueries?: Function[]
	}): Promise<ApolloResult<Result>> {
		const response = await args.apollo
			.mutate<Result>({
				mutation: args.mutation,
				variables: args.variables,
				errorPolicy
			})
			.toPromise()

		if (args.refetchQueries != null && response.error == null) {
			this.addRefetchQuery(...args.refetchQueries)
		}

		return response
	}

	login(
		queryData: string,
		variables: {
			companyUuid: string
			userName: string
			password: string
			registerUuid: string
			registerClientSerialNumber: string
		}
	) {
		return this.mutate<{ login: SessionResource }>({
			apollo: this.davAuthApollo,
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
			variables
		})
	}

	retrieveOwnUser(queryData: string) {
		return this.query<{ retrieveOwnUser: UserResource }>({
			apollo: this.blackmoneyAuthApollo,
			query: gql`
				query RetrieveOwnUser {
					retrieveOwnUser {
						${queryData}
					}
				}
			`
		})
	}

	retrieveUser(queryData: string, variables: { uuid: string }) {
		return this.query<{ retrieveUser: UserResource }>({
			apollo: this.blackmoneyAuthApollo,
			query: gql`
				query RetrieveUser($uuid: String!) {
					retrieveUser(uuid: $uuid) {
						${queryData}
					}
				}
			`,
			variables
		})
	}

	createOwner(
		queryData: string,
		variables: {
			companyUuid: string
			name: string
			password: string
		}
	) {
		return this.mutate<{ createOwner: UserResource }>({
			apollo: this.davAuthApollo,
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
			variables
		})
	}

	createUser(
		queryData: string,
		variables: {
			companyUuid: string
			name: string
			role?: UserRole
			restaurants: string[]
		}
	) {
		return this.mutate<{ createUser: UserResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			refetchQueries: [this.retrieveCompany]
		})
	}

	setPasswordForUser(
		queryData: string,
		variables: {
			uuid: string
			password: string
		}
	) {
		return this.mutate<{ setPasswordForUser: UserResource }>({
			apollo: this.davAuthApollo,
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
			variables
		})
	}

	resetPasswordOfUser(
		queryData: string,
		variables: {
			uuid: string
		}
	) {
		return this.mutate<{ resetPasswordOfUser: UserResource }>({
			apollo: this.blackmoneyAuthApollo,
			mutation: gql`
				mutation ResetPasswordOfUser($uuid: String!) {
					resetPasswordOfUser(uuid: $uuid) {
						${queryData}
					}
				}
			`,
			variables
		})
	}

	retrieveCompany(queryData: string) {
		return this.query<{ retrieveCompany: CompanyResource }>({
			apollo: this.davAuthApollo,
			query: gql`
				query RetrieveCompany {
					retrieveCompany {
						${queryData}
					}
				}
			`
		})
	}

	createCompany(queryData: string, variables: { name: string }) {
		return this.mutate<{ createCompany: CompanyResource }>({
			apollo: this.davAuthApollo,
			mutation: gql`
				mutation CreateCompany($name: String!) {
					createCompany(name: $name) {
						${queryData}
					}
				}
			`,
			variables
		})
	}

	retrieveRestaurant(
		queryData: string,
		variables: { uuid: string }
	) {
		return this.query<{ retrieveRestaurant: RestaurantResource }>({
			apollo: this.davAuthApollo,
			query: gql`
				query RetrieveRestaurant($uuid: String!) {
					retrieveRestaurant(uuid: $uuid) {
						${queryData}
					}
				}
			`,
			variables
		})
	}

	updateRestaurant(
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
	) {
		return this.mutate<{ updateRestaurant: RestaurantResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			refetchQueries: [this.retrieveCompany, this.retrieveRestaurant]
		})
	}

	retrieveRegister(queryData: string, variables: { uuid: string }) {
		return this.query<{ retrieveRegister: RegisterResource }>({
			apollo: this.blackmoneyAuthApollo,
			query: gql`
				query RetrieveRegister($uuid: String!) {
					retrieveRegister(uuid: $uuid) {
						${queryData}
					}
				}
			`,
			variables
		})
	}

	createRegister(
		queryData: string,
		variables: {
			restaurantUuid: string
			name: string
		}
	) {
		return this.mutate<{ createRegister: RegisterResource }>({
			apollo: this.davAuthApollo,
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
			variables
		})
	}

	activateRegister(
		queryData: string,
		variables: {
			uuid: string
		}
	) {
		return this.mutate<{ activateRegister: RegisterResource }>({
			apollo: this.davAuthApollo,
			mutation: gql`
				mutation ActivateRegister($uuid: String!) {
					activateRegister(uuid: $uuid) {
						${queryData}
					}
				}
			`,
			variables,
			refetchQueries: [this.retrieveRegister]
		})
	}

	retrieveRegisterClient(
		queryData: string,
		variables: { uuid: string }
	) {
		return this.query<{ retrieveRegisterClient: RegisterClientResource }>({
			apollo: this.blackmoneyAuthApollo,
			query: gql`
				query RetrieveRegisterClient($uuid: String!) {
					retrieveRegisterClient(uuid: $uuid) {
						${queryData}
					}
				}
			`,
			variables
		})
	}

	retrieveRegisterClientBySerialNumber(
		queryData: string,
		variables: {
			registerUuid: string
			serialNumber: string
		}
	) {
		return this.query<{
			retrieveRegisterClientBySerialNumber: RegisterClientResource
		}>({
			apollo: this.blackmoneyAuthApollo,
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
			variables
		})
	}

	updateRegisterClient(
		queryData: string,
		variables: {
			uuid: string
			name?: string
		}
	) {
		return this.mutate<{ updateRegisterClient: RegisterClientResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			refetchQueries: [
				this.retrieveRegisterClient,
				this.retrieveRegisterClientBySerialNumber
			]
		})
	}

	searchPrinters(
		queryData: string,
		variables: {
			restaurantUuid: string
			query: string
			exclude?: string[]
		}
	) {
		return this.query<{ searchPrinters: List<PrinterResource> }>({
			apollo: this.blackmoneyAuthApollo,
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
			variables
		})
	}

	createPrinter(
		queryData: string,
		variables: {
			restaurantUuid: string
			name: string
			ipAddress: string
		}
	) {
		return this.mutate<{ createPrinter: PrinterResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			refetchQueries: [this.retrieveRestaurant, this.searchPrinters]
		})
	}

	updatePrinter(
		queryData: string,
		variables: {
			uuid: string
			name: string
			ipAddress: string
		}
	) {
		return this.mutate<{ updatePrinter: PrinterResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			refetchQueries: [this.retrieveRestaurant, this.searchPrinters]
		})
	}

	createPrintRule(
		queryData: string,
		variables: {
			registerClientUuid: string
			type: PrintRuleType
			productType?: ProductType
			printerUuids: string[]
			categoryUuids?: string[]
			productUuids?: string[]
		}
	) {
		return this.mutate<{ createPrintRule: PrintRuleResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			refetchQueries: [this.retrieveRegisterClient]
		})
	}

	updatePrintRule(
		queryData: string,
		variables: {
			uuid: string
			printerUuids: string[]
			categoryUuids?: string[]
			productUuids?: string[]
		}
	) {
		return this.mutate<{ updatePrintRule: PrintRuleResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			refetchQueries: [this.retrieveRegisterClient]
		})
	}

	deletePrintRule(queryData: string, variables: { uuid: string }) {
		return this.mutate<{ deletePrintRule: PrintRuleResource }>({
			apollo: this.blackmoneyAuthApollo,
			mutation: gql`
				mutation DeletePrintRule($uuid: String!) {
					deletePrintRule(uuid: $uuid) {
						${queryData}
					}
				}
			`,
			variables,
			refetchQueries: [this.retrieveRegisterClient]
		})
	}

	retrieveRoom(
		queryData: string,
		variables: {
			uuid: string
		}
	) {
		return this.query<{ retrieveRoom: RoomResource }>({
			apollo: this.blackmoneyAuthApollo,
			query: gql`
				query RetrieveRoom($uuid: String!) {
					retrieveRoom(uuid: $uuid) {
						${queryData}
					}
				}
			`,
			variables
		})
	}

	listRooms(
		queryData: string,
		variables: {
			restaurantUuid: string
		}
	) {
		return this.query<{ listRooms: List<RoomResource> }>({
			apollo: this.blackmoneyAuthApollo,
			query: gql`
				query ListRooms($restaurantUuid: String!) {
					listRooms(restaurantUuid: $restaurantUuid) {
						${queryData}
					}
				}
			`,
			variables
		})
	}

	createRoom(
		queryData: string,
		variables: { restaurantUuid: string; name: string }
	) {
		return this.mutate<{ createRoom: RoomResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			refetchQueries: [this.retrieveRestaurant, this.listRooms]
		})
	}

	updateRoom(
		queryData: string,
		variables: { uuid: string; name: string }
	) {
		return this.mutate<{ updateRoom: RoomResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			refetchQueries: [
				this.retrieveRestaurant,
				this.retrieveRoom,
				this.listRooms
			]
		})
	}

	deleteRoom(queryData: string, variables: { uuid: string }) {
		return this.mutate<{ deleteRoom: RoomResource }>({
			apollo: this.blackmoneyAuthApollo,
			mutation: gql`
				mutation DeleteRoom($uuid: String!) {
					deleteRoom(uuid: $uuid) {
						${queryData}
					}
				}
			`,
			variables,
			refetchQueries: [
				this.retrieveRestaurant,
				this.retrieveRoom,
				this.listRooms
			]
		})
	}

	createTable(
		queryData: string,
		variables: { roomUuid: string; name: number; seats: number }
	) {
		return this.mutate<{ createTable: TableResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			refetchQueries: [this.retrieveRestaurant, this.retrieveRoom]
		})
	}

	updateTable(
		queryData: string,
		variables: { uuid: string; seats?: number }
	) {
		return this.mutate<{ updateTable: TableResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			refetchQueries: [this.retrieveRestaurant]
		})
	}

	deleteTable(queryData: string, variables: { uuid: string }) {
		return this.mutate<{ deleteTable: TableResource }>({
			apollo: this.blackmoneyAuthApollo,
			mutation: gql`
				mutation DeleteTable($uuid: String!) {
					deleteTable(uuid: $uuid) {
						${queryData}
					}
				}
			`,
			variables,
			refetchQueries: [this.retrieveRestaurant]
		})
	}

	retrieveCategory(
		queryData: string,
		variables: { uuid: string; type?: ProductType }
	) {
		const typeParam = queryData.includes("products")
			? "$type: ProductType"
			: ""

		return this.query<{ retrieveCategory: CategoryResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			variables
		})
	}

	searchCategories(
		queryData: string,
		variables: {
			restaurantUuid: string
			query: string
			exclude?: string[]
		}
	) {
		return this.query<{ searchCategories: List<CategoryResource> }>({
			apollo: this.blackmoneyAuthApollo,
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
			variables
		})
	}

	listCategories(
		queryData: string,
		variables: {
			restaurantUuid: string
		}
	) {
		return this.query<{ listCategories: List<CategoryResource> }>({
			apollo: this.blackmoneyAuthApollo,
			query: gql`
				query ListCategories($restaurantUuid: String!) {
					listCategories(restaurantUuid: $restaurantUuid) {
						${queryData}
					}
				}
			`,
			variables
		})
	}

	createCategory(
		queryData: string,
		variables: {
			restaurantUuid: string
			name: string
		}
	) {
		return this.mutate<{ createCategory: CategoryResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			refetchQueries: [this.searchCategories, this.listCategories]
		})
	}

	updateCategory(
		queryData: string,
		variables: {
			uuid: string
			name?: string
		}
	) {
		return this.mutate<{ updateCategory: CategoryResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			refetchQueries: [
				this.retrieveCategory,
				this.searchCategories,
				this.listCategories
			]
		})
	}

	deleteCategory(queryData: string, variables: { uuid: string }) {
		return this.mutate<{ deleteCategory: CategoryResource }>({
			apollo: this.blackmoneyAuthApollo,
			mutation: gql`
				mutation DeleteCategory($uuid: String!) {
					deleteCategory(uuid: $uuid) {
						${queryData}
					}
				}
			`,
			variables,
			refetchQueries: [
				this.retrieveCategory,
				this.searchCategories,
				this.listCategories
			]
		})
	}

	searchProducts(
		queryData: string,
		variables: {
			restaurantUuid: string
			query: string
			exclude?: string[]
		}
	) {
		return this.query<{ searchProducts: List<CategoryResource> }>({
			apollo: this.blackmoneyAuthApollo,
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
			variables
		})
	}

	createProduct(
		queryData: string,
		variables: {
			categoryUuid: string
			name: string
			price: number
			type: ProductType
			shortcut?: number
			variationUuids?: string[]
		}
	) {
		return this.mutate<{ createProduct: ProductResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			refetchQueries: [this.searchProducts]
		})
	}

	updateProduct(
		queryData: string,
		variables: {
			uuid: string
			name?: string
			price?: number
			shortcut?: number
			variationUuids?: string[]
		}
	) {
		return this.mutate<{ updateProduct: ProductResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			refetchQueries: [this.searchProducts]
		})
	}

	deleteProduct(queryData: string, variables: { uuid: string }) {
		return this.mutate<{ deleteProduct: ProductResource }>({
			apollo: this.blackmoneyAuthApollo,
			mutation: gql`
				mutation DeleteProduct($uuid: String!) {
					deleteProduct(uuid: $uuid) {
						${queryData}
					}
				}
			`,
			variables,
			refetchQueries: [this.searchProducts]
		})
	}

	createOffer(
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
	) {
		return this.mutate<{ createOffer: OfferResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			variables
		})
	}

	updateOffer(
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
	) {
		return this.mutate<{ updateOffer: OfferResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			variables
		})
	}

	deleteOffer(queryData: string, variables: { uuid: string }) {
		return this.mutate<{ deleteOffer: OfferResource }>({
			apollo: this.blackmoneyAuthApollo,
			mutation: gql`
				mutation DeleteOffer($uuid: String!) {
					deleteOffer(uuid: $uuid) {
						${queryData}
					}
				}
			`,
			variables
		})
	}

	retrieveTable(
		queryData: string,
		variables: { uuid: string; paid?: boolean }
	) {
		const paidParam = queryData.includes("paid") ? "$paid: Boolean" : ""

		return this.query<{ retrieveTable: TableResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			variables
		})
	}

	listOrders(queryData: string, variables: { completed?: boolean }) {
		return this.query<{ listOrders: List<OrderResource> }>({
			apollo: this.blackmoneyAuthApollo,
			query: gql`
				query ListOrders($completed:Boolean) {
					listOrders(completed:$completed) {
						${queryData}
					}
				}
			`,
			variables
		})
	}

	createOrder(queryData: string, variables: { tableUuid: string }) {
		return this.mutate<{ createOrder: OrderResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			variables
		})
	}

	updateOrder(
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
	) {
		return this.mutate<{ updateOrder: OrderResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			variables
		})
	}

	addProductsToOrder(
		queryData: string,
		variables: {
			uuid: string
			products: AddOrderItemInput[]
		}
	) {
		return this.mutate<{ addProductsToOrder: OrderResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			refetchQueries: [this.retrieveTable]
		})
	}

	removeProductsFromOrder(
		queryData: string,
		variables: {
			uuid: string
			products: AddOrderItemInput[]
		}
	) {
		return this.mutate<{ removeProductsFromOrder: OrderResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			variables
		})
	}

	completeOrder(
		queryData: string,
		variables: {
			uuid: string
			billUuid: string
			paymentMethod: PaymentMethod
		}
	) {
		return this.mutate<{ completeOrder: OrderResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			refetchQueries: [this.listOrders]
		})
	}

	updateOrderItem(
		queryData: string,
		variables: {
			uuid: string
			count: number
			orderItemVariations: {
				uuid: string
				count: number
			}[]
		}
	) {
		return this.mutate<{ updateOrderItem: OrderResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			variables
		})
	}

	createBill(
		queryData: string,
		variables: { registerClientUuid: string }
	) {
		return this.mutate<{ createBill: BillResource }>({
			apollo: this.blackmoneyAuthApollo,
			mutation: gql`
				mutation CreateBill($registerClientUuid: String!) {
					createBill(registerClientUuid: $registerClientUuid) {
						${queryData}
					}
				}
			`,
			variables
		})
	}

	listReservations(
		queryData: string,
		variables: {
			restaurantUuid: string
			date: string
		}
	) {
		return this.query<{ listReservations: List<ReservationResource> }>({
			apollo: this.blackmoneyAuthApollo,
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
			variables
		})
	}

	updateReservation(
		queryData: string,
		variables: {
			uuid: string
			checkedIn?: boolean
		}
	) {
		return this.mutate<{ updateReservation: ReservationResource }>({
			apollo: this.blackmoneyAuthApollo,
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
			variables
		})
	}

	createStripeAccountOnboardingLink(
		queryData: string,
		variables: {
			refreshUrl: string
			returnUrl: string
		}
	) {
		return this.mutate<{ createStripeAccountOnboardingLink: { url: string } }>({
			apollo: this.blackmoneyAuthApollo,
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
			variables
		})
	}

	createStripeBillingPortalSession(
		queryData: string,
		variables: {
			returnUrl: string
		}
	) {
		return this.mutate<{ createStripeBillingPortalSession: { url: string } }>({
			apollo: this.blackmoneyAuthApollo,
			mutation: gql`
				mutation CreateStripeBillingPortalSession($returnUrl: String!) {
					createStripeBillingPortalSession(returnUrl: $returnUrl) {
						${queryData}
					}
				}
			`,
			variables
		})
	}

	createStripeSubscriptionCheckoutSession(
		queryData: string,
		variables: {
			successUrl: string
			cancelUrl: string
		}
	) {
		return this.mutate<{ createStripeSubscriptionCheckoutSession: { url: string } }>(
			{
				apollo: this.blackmoneyAuthApollo,
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
				variables
			}
		)
	}

	createStripeConnectionToken(queryData: string) {
		return this.mutate<{ createStripeConnectionToken: { secret: string } }>({
			apollo: this.blackmoneyAuthApollo,
			mutation: gql`
				mutation CreateStripeConnectionToken {
					createStripeConnectionToken {
						${queryData}
					}
				}
			`
		})
	}

	captureStripePaymentIntent(
		queryData: string,
		variables: { id: string }
	) {
		return this.mutate<{ captureStripePaymentIntent: { id: string } }>({
			apollo: this.blackmoneyAuthApollo,
			mutation: gql`
				mutation CaptureStripePaymentIntent($id: String!) {
					captureStripePaymentIntent(id: $id) {
						${queryData}
					}
				}
			`,
			variables
		})
	}
}
