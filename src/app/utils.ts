import { Router } from "@angular/router"
import { ApolloQueryResult } from "@apollo/client"
import { MutationResult } from "apollo-angular"
import FingerprintJS from "@fingerprintjs/fingerprintjs"
import { Toast } from "dav-ui-components"
import { ApiService } from "./services/api-service"
import { DataService } from "./services/data-service"
import { SettingsService } from "./services/settings-service"
import { AuthService } from "./services/auth-service"
import { Company } from "./models/Company"
import { Restaurant } from "./models/Restaurant"
import { Register } from "./models/Register"
import { RegisterClient } from "./models/RegisterClient"
import { Printer } from "./models/Printer"
import { PrintRule } from "./models/PrintRule"
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
import { Menu } from "./models/Menu"
import { Offer } from "./models/Offer"
import { OfferItem } from "./models/OfferItem"
import {
	CategoryResource,
	CompanyResource,
	RestaurantResource,
	RegisterResource,
	RegisterClientResource,
	PrintRuleResource,
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
	OfferResource,
	OfferItemResource,
	ErrorCode,
	Theme,
	OrderItemType
} from "./types"
import { darkThemeKey, lightThemeKey } from "./constants"

export async function loadRegisterClient(
	settingsService: SettingsService,
	authService: AuthService,
	apiService: ApiService,
	dataService: DataService
) {
	const registerUuid = await settingsService.getRegister()

	if (registerUuid != null) {
		const retrieveRegisterClientResponse =
			await apiService.retrieveRegisterClientBySerialNumber(
				`
					uuid
					name
					serialNumber
				`,
				{
					registerUuid,
					serialNumber: await getSerialNumber(settingsService)
				}
			)

		if (
			getGraphQLErrorCodes(retrieveRegisterClientResponse).includes(
				"NOT_AUTHENTICATED"
			)
		) {
			// Remove the access token
			authService.removeAccessToken()
		} else if (
			retrieveRegisterClientResponse.data
				?.retrieveRegisterClientBySerialNumber != null
		) {
			dataService.registerClient =
				convertRegisterClientResourceToRegisterClient(
					retrieveRegisterClientResponse.data
						.retrieveRegisterClientBySerialNumber
				)
		}
	}

	dataService.registerClientPromiseHolder.Resolve()
}

export function calculateTotalPriceOfOrderItem(orderItem: OrderItem): string {
	if (
		orderItem.type === OrderItemType.Menu ||
		orderItem.type === OrderItemType.Special
	) {
		let total = 0

		total += orderItem.discount * orderItem.count

		for (let item of orderItem.orderItems) {
			total += item.product.price * item.count

			if (item.orderItemVariations) {
				for (const variation of item.orderItemVariations) {
					for (const variationItem of variation.variationItems) {
						total += variationItem.additionalCost * variation.count
					}
				}
			}
		}

		return (total / 100).toFixed(2).replace(".", ",")
	} else {
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

export async function getSerialNumber(
	settingsService: SettingsService
): Promise<string> {
	let serialNumber = await settingsService.getSerialNumber()

	if (serialNumber == null) {
		const fingerprintAgent = await FingerprintJS.load()
		const result = await fingerprintAgent.get()

		serialNumber = result.visitorId
		await settingsService.setSerialNumber(serialNumber)
	}

	return serialNumber
}

export async function showToast(text: string, paddingBottom: number = 0) {
	// Show toast
	let toast = document.createElement("dav-toast")
	toast.text = text
	toast.paddingBottom = paddingBottom
	Toast.show(toast)
}

//#region Converter functions
export function convertCompanyResourceToCompany(
	companyResource: CompanyResource
): Company {
	if (companyResource == null) {
		return null
	}

	const restaurants: Restaurant[] = []

	for (const restaurant of companyResource.restaurants?.items ?? []) {
		restaurants.push(convertRestaurantResourceToRestaurant(restaurant))
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

	for (const user of restaurantResource.users?.items ?? []) {
		users.push(convertUserResourceToUser(user))
	}

	const rooms: Room[] = []

	for (const room of restaurantResource.rooms?.items ?? []) {
		rooms.push(convertRoomResourceToRoom(room))
	}

	const registers: Register[] = []

	for (const register of restaurantResource.registers?.items ?? []) {
		registers.push(convertRegisterResourceToRegister(register))
	}

	const printers: Printer[] = []

	for (const printer of restaurantResource.printers?.items ?? []) {
		printers.push(convertPrinterResourceToPrinter(printer))
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
		registers,
		printers,
		menu: convertMenuResourceToMenu(restaurantResource.menu)
	}
}

export function convertRegisterResourceToRegister(
	registerResource: RegisterResource
): Register {
	if (registerResource == null) {
		return null
	}

	const registerClients: RegisterClient[] = []

	for (const registerClient of registerResource.registerClients?.items ?? []) {
		registerClients.push(
			convertRegisterClientResourceToRegisterClient(registerClient)
		)
	}

	return {
		uuid: registerResource.uuid,
		name: registerResource.name,
		registerClients
	}
}

export function convertRegisterClientResourceToRegisterClient(
	registerClientResource: RegisterClientResource
): RegisterClient {
	if (registerClientResource == null) {
		return null
	}

	const printRules: PrintRule[] = []

	for (const printRule of registerClientResource.printRules?.items ?? []) {
		printRules.push(convertPrintRuleResourceToPrintRule(printRule))
	}

	return {
		uuid: registerClientResource.uuid,
		name: registerClientResource.name,
		serialNumber: registerClientResource.serialNumber,
		printRules
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

	for (const table of roomResource.tables?.items ?? []) {
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
		name: tableResource.name,
		seats: tableResource.seats
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

export function convertPrintRuleResourceToPrintRule(
	printRuleResource: PrintRuleResource
): PrintRule {
	if (printRuleResource == null) {
		return null
	}

	const printers: Printer[] = []

	for (const printer of printRuleResource.printers?.items ?? []) {
		printers.push(convertPrinterResourceToPrinter(printer))
	}

	const categories: Category[] = []

	for (const category of printRuleResource.categories?.items ?? []) {
		categories.push(convertCategoryResourceToCategory(category))
	}

	const products: Product[] = []

	for (const product of printRuleResource.products?.items ?? []) {
		products.push(convertProductResourceToProduct(product))
	}

	return {
		uuid: printRuleResource.uuid,
		type: printRuleResource.type,
		productType: printRuleResource.productType,
		printers,
		categories,
		products
	}
}

export function convertMenuResourceToMenu(menuResource: MenuResource): Menu {
	if (menuResource == null) {
		return null
	}

	const categories: Category[] = []

	for (const category of menuResource.categories?.items ?? []) {
		categories.push(convertCategoryResourceToCategory(category))
	}

	const offers: Offer[] = []

	for (const offer of menuResource.offers?.items ?? []) {
		offers.push(convertOfferResourceToOffer(offer))
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

	for (const offerItem of offerResource.offerItems?.items ?? []) {
		offerItems.push(convertOfferItemResourceToOfferItem(offerItem))
	}

	return {
		id: offerResource.id,
		uuid: offerResource.uuid,
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

	for (const product of offerItemResource.products?.items ?? []) {
		products.push(convertProductResourceToProduct(product))
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

	for (const variation of productResource.variations?.items ?? []) {
		variations.push(convertVariationResourceToVariation(variation))
	}

	return {
		id: productResource.id,
		uuid: productResource.uuid,
		type: productResource.type,
		name: productResource.name,
		price: productResource.price,
		category: convertCategoryResourceToCategory(productResource.category),
		offer: convertOfferResourceToOffer(productResource.offer),
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

	for (const product of categoryResource.products?.items ?? []) {
		products.push(convertProductResourceToProduct(product))
	}

	return {
		uuid: categoryResource.uuid,
		name: categoryResource.name,
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

	for (const variationItem of variationResource.variationItems?.items ?? []) {
		variationItems.push(
			convertVariationItemResourceToVariationItem(variationItem)
		)
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

	for (const orderItem of orderResource.orderItems?.items ?? []) {
		orderItems.push(convertOrderItemResourceToOrderItem(orderItem))
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

	const orderItems: OrderItem[] = []

	for (const orderItem of orderItemResource.orderItems?.items ?? []) {
		orderItems.push(convertOrderItemResourceToOrderItem(orderItem))
	}

	const orderItemVariations: OrderItemVariation[] = []

	for (const orderItemVariation of orderItemResource.orderItemVariations
		?.items ?? []) {
		orderItemVariations.push(
			convertOrderItemVariationResourceToOrderItemVariation(
				orderItemVariation
			)
		)
	}

	return {
		uuid: orderItemResource.uuid,
		type: orderItemResource.type,
		count: orderItemResource.count,
		order: convertOrderResourceToOrder(orderItemResource.order),
		product: convertProductResourceToProduct(orderItemResource.product),
		orderItems,
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

	for (const variationItem of orderItemVariationResource.variationItems
		?.items ?? []) {
		variationItems.push(
			convertVariationItemResourceToVariationItem(variationItem)
		)
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
