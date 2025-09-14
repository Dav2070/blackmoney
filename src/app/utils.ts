import { Router } from "@angular/router"
import { ApolloQueryResult } from "@apollo/client"
import { MutationResult } from "apollo-angular"
import { ApiService } from "./services/api-service"
import { DataService } from "./services/data-service"
import { SettingsService } from "./services/settings-service"
import { AuthService } from "./services/auth-service"
import { Company } from "./models/Company"
import { User } from "./models/User"
import { Room } from "./models/Room"
import { Table } from "./models/Table"
import { Category } from "./models/Category"
import { Product } from "./models/Product"
import { Variation } from "./models/Variation"
import { VariationItem } from "./models/VariationItem"
import { Order } from "./models/Order"
import { OrderItem } from "./models/OrderItem"
import { OrderItemVariation } from "./models/OrderItemVariation"
import { Bill } from "./models/Bill"
import { Restaurant } from "./models/Restaurant"
import { Printer } from "./models/Printer"
import { Menu } from "./models/Menu"
import { Offer } from "./models/Offer"
import { OfferItem } from "./models/OfferItem"
import {
	CategoryResource,
	CompanyResource,
	ProductResource,
	RoomResource,
	TableResource,
	PrinterResource,
	MenuResource,
	UserResource,
	VariationResource,
	VariationItemResource,
	OrderResource,
	OrderItemResource,
	OrderItemVariationResource,
	BillResource,
	RestaurantResource,
	OfferResource,
	OfferItemResource,
	ErrorCode,
	Theme
} from "./types"
import { darkThemeKey, lightThemeKey } from "./constants"

export function calculateTotalPriceOfOrderItem(orderItem: OrderItem) {
	let total = 0

	for (let variation of orderItem.orderItemVariations) {
		for (let variationItem of variation.variationItems) {
			total += variation.count * variationItem.additionalCost
		}
	}

	return ((total + orderItem.product.price * orderItem.count) / 100)
		.toFixed(2)
		.replace(".", ",")
}

export function getGraphQLErrorCodes(
	response: ApolloQueryResult<any> | MutationResult<any>
): ErrorCode[] {
	if (response.errors == null) {
		return []
	}

	const errorCodes: ErrorCode[] = []

	for (let error of response.errors) {
		if (error.extensions == null) continue

		if (error.extensions["code"] === "VALIDATION_FAILED") {
			const validationErrors = error.extensions["errors"] as
				| string[]
				| undefined

			if (validationErrors != null) {
				for (let validationError of validationErrors) {
					errorCodes.push(validationError as ErrorCode)
				}
			}
		} else {
			errorCodes.push(error.extensions["code"] as ErrorCode)
		}
	}

	return errorCodes
}

export function randomNumber(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function initUserAfterLogin(
	accessToken: string,
	restaurantUuid: string,
	user: UserResource,
	apiService: ApiService,
	authService: AuthService,
	dataService: DataService,
	settingsService: SettingsService,
	router: Router
): Promise<void> {
	await authService.setAccessToken(accessToken)
	dataService.loadApollo(accessToken)
	apiService.loadApolloClients()

	dataService.user = convertUserResourceToUser(user)
	dataService.blackmoneyUserPromiseHolder.Resolve()

	await settingsService.setRestaurant(restaurantUuid)

	// Redirect to user page
	router.navigate(["user"])
}

//#region Converter functions
export function convertCompanyResourceToCompany(
	companyResource: CompanyResource
): Company {
	if (companyResource == null) {
		return null
	}

	const restaurants: Restaurant[] = []

	if (companyResource.restaurants != null) {
		for (let restaurant of companyResource.restaurants.items) {
			restaurants.push(convertRestaurantResourceToRestaurant(restaurant))
		}
	}

	return {
		uuid: companyResource.uuid,
		name: companyResource.name,
		restaurants
	}
}

export function convertRestaurantResourceToRestaurant(
	restaurantResource: RestaurantResource
): Restaurant {
	if (restaurantResource == null) {
		return null
	}

	const users: User[] = []

	if (restaurantResource.users != null) {
		for (let user of restaurantResource.users.items) {
			users.push(convertUserResourceToUser(user))
		}
	}

	const rooms: Room[] = []

	if (restaurantResource.rooms != null) {
		for (let room of restaurantResource.rooms.items) {
			rooms.push(convertRoomResourceToRoom(room))
		}
	}

	const printers: Printer[] = []

	if (restaurantResource.printers != null) {
		for (let printer of restaurantResource.printers.items) {
			printers.push(convertPrinterResourceToPrinter(printer))
		}
	}

	return {
		uuid: restaurantResource.uuid,
		name: restaurantResource.name,
		city: restaurantResource.city,
		country: restaurantResource.country,
		line1: restaurantResource.line1,
		line2: restaurantResource.line2,
		postalCode: restaurantResource.postalCode,
		users,
		rooms,
		printers,
		menu: convertMenuResourceToMenu(restaurantResource.menu)
	}
}

export function convertUserResourceToUser(userResource: UserResource): User {
	if (userResource == null) {
		return null
	}

	return {
		uuid: userResource.uuid,
		name: userResource.name,
		role: userResource.role
	}
}

export function convertRoomResourceToRoom(roomResource: RoomResource): Room {
	if (roomResource == null) {
		return null
	}

	const tables: Table[] = []

	for (let table of roomResource.tables.items) {
		tables.push(convertTableResourceToTable(table))
	}

	return {
		uuid: roomResource.uuid,
		name: roomResource.name,
		tables
	}
}

export function convertTableResourceToTable(
	tableResource: TableResource
): Table {
	if (tableResource == null) {
		return null
	}

	return {
		uuid: tableResource.uuid,
		name: tableResource.name
	}
}

export function convertPrinterResourceToPrinter(
	printerResource: PrinterResource
): Printer {
	if (printerResource == null) {
		return null
	}

	return {
		uuid: printerResource.uuid,
		name: printerResource.name,
		ipAddress: printerResource.ipAddress
	}
}

export function convertMenuResourceToMenu(menuResource: MenuResource): Menu {
	if (menuResource == null) {
		return null
	}

	const categories: Category[] = []

	if (menuResource.categories != null) {
		for (let category of menuResource.categories.items) {
			categories.push(convertCategoryResourceToCategory(category))
		}
	}

	const offers: Offer[] = []

	if (menuResource.offers != null) {
		for (let offer of menuResource.offers.items) {
			offers.push(convertOfferResourceToOffer(offer))
		}
	}

	return {
		uuid: menuResource.uuid,
		categories,
		offers
	}
}

export function convertOfferResourceToOffer(
	offerResource: OfferResource
): Offer {
	if (offerResource == null) {
		return null
	}

	const offerItems: OfferItem[] = []

	if (offerResource.offerItems != null) {
		for (let offerItem of offerResource.offerItems.items) {
			offerItems.push(convertOfferItemResourceToOfferItem(offerItem))
		}
	}

	return {
		id: offerResource.id,
		uuid: offerResource.uuid,
		name: offerResource.name,
		offerType: offerResource.offerType,
		discountType: offerResource.discountType,
		offerValue: offerResource.offerValue,
		startDate: offerResource.startDate
			? new Date(offerResource.startDate)
			: undefined,
		endDate: offerResource.endDate
			? new Date(offerResource.endDate)
			: undefined,
		startTime: offerResource.startTime,
		endTime: offerResource.endTime,
		weekdays: offerResource.weekdays,
		offerItems
	}
}

export function convertOfferItemResourceToOfferItem(
	offerItemResource: OfferItemResource
): OfferItem {
	if (offerItemResource == null) {
		return null
	}

	const products: Product[] = []

	if (offerItemResource.products != null) {
		for (let product of offerItemResource.products.items) {
			products.push(convertProductResourceToProduct(product))
		}
	}

	return {
		uuid: offerItemResource.uuid,
		name: offerItemResource.name,
		maxSelections: offerItemResource.maxSelections,
		products
	}
}

export function convertProductResourceToProduct(
	productResource: ProductResource
): Product {
	if (productResource == null) {
		return null
	}

	const variations: Variation[] = []

	if (productResource.variations != null) {
		for (let variation of productResource.variations.items) {
			variations.push(convertVariationResourceToVariation(variation))
		}
	}

	return {
		id: productResource.id,
		uuid: productResource.uuid,
		name: productResource.name,
		price: productResource.price,
		category: convertCategoryResourceToCategory(productResource.category),
		variations
	}
}

export function convertCategoryResourceToCategory(
	categoryResource: CategoryResource
): Category {
	if (categoryResource == null) {
		return null
	}

	const products: Product[] = []

	if (categoryResource.products != null) {
		for (let product of categoryResource.products.items) {
			products.push(convertProductResourceToProduct(product))
		}
	}

	return {
		uuid: categoryResource.uuid,
		name: categoryResource.name,
		type: categoryResource.type,
		products
	}
}

export function convertVariationResourceToVariation(
	variationResource: VariationResource
): Variation {
	if (variationResource == null) {
		return null
	}

	const variationItems: VariationItem[] = []

	if (variationResource.variationItems != null) {
		for (let variationItem of variationResource.variationItems.items) {
			variationItems.push(
				convertVariationItemResourceToVariationItem(variationItem)
			)
		}
	}

	return {
		uuid: variationResource.uuid,
		name: variationResource.name,
		variationItems
	}
}

export function convertVariationItemResourceToVariationItem(
	variationItemResource: VariationItemResource
): VariationItem {
	if (variationItemResource == null) {
		return null
	}

	return {
		id: variationItemResource.id,
		uuid: variationItemResource.uuid,
		name: variationItemResource.name,
		additionalCost: variationItemResource.additionalCost
	}
}

export function convertBillResourceToBill(billResource: BillResource): Bill {
	if (billResource == null) {
		return null
	}
	return {
		uuid: billResource.uuid
	}
}

export function convertOrderResourceToOrder(
	orderResource: OrderResource
): Order {
	if (orderResource == null) {
		return null
	}

	const orderItems: OrderItem[] = []

	if (orderResource.orderItems != null) {
		for (let orderItem of orderResource.orderItems.items) {
			orderItems.push(convertOrderItemResourceToOrderItem(orderItem))
		}
	}

	return {
		uuid: orderResource.uuid,
		totalPrice: orderResource.totalPrice,
		paymentMethod: orderResource.paymentMethod,
		paidAt: new Date(orderResource.paidAt),
		bill: convertBillResourceToBill(orderResource.bill),
		table: convertTableResourceToTable(orderResource.table),
		orderItems
	}
}

export function convertOrderItemResourceToOrderItem(
	orderItemResource: OrderItemResource
): OrderItem {
	if (orderItemResource == null) {
		return null
	}

	const orderItemVariations: OrderItemVariation[] = []

	if (orderItemResource.orderItemVariations != null) {
		for (let orderItemVariation of orderItemResource.orderItemVariations
			.items) {
			orderItemVariations.push(
				convertOrderItemVariationResourceToOrderItemVariation(
					orderItemVariation
				)
			)
		}
	}

	return {
		uuid: orderItemResource.uuid,
		count: orderItemResource.count,
		order: convertOrderResourceToOrder(orderItemResource.order),
		product: convertProductResourceToProduct(orderItemResource.product),
		orderItemVariations
	}
}

export function convertOrderItemVariationResourceToOrderItemVariation(
	orderItemVariationResource: OrderItemVariationResource
): OrderItemVariation {
	if (orderItemVariationResource == null) {
		return null
	}

	const variationItems: VariationItem[] = []

	if (orderItemVariationResource.variationItems != null) {
		for (let variationItem of orderItemVariationResource.variationItems
			.items) {
			variationItems.push(
				convertVariationItemResourceToVariationItem(variationItem)
			)
		}
	}

	return {
		uuid: orderItemVariationResource.uuid,
		count: orderItemVariationResource.count,
		variationItems
	}
}

export function convertStringToTheme(value: string): Theme {
	switch (value) {
		case lightThemeKey:
			return Theme.Light
		case darkThemeKey:
			return Theme.Dark
		default:
			return Theme.System
	}
}
//#endregion
