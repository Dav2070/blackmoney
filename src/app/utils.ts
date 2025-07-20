import { ApolloQueryResult } from "@apollo/client"
import { Company } from "./models/Company"
import { User } from "./models/User"
import { Room } from "./models/Room"
import {
	CategoryResource,
	CompanyResource,
	ProductResource,
	RoomResource,
	TableResource,
	UserResource,
	VariationResource,
	VariationItemResource,
	OrderResource,
	OrderItemResource,
	OrderItemVariationResource,
	BillResource,
	RestaurantResource,
	ErrorCode
} from "./types"
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

export function calculateTotalPriceOfOrderItem(orderItem: OrderItem) {
	let total = 0

	for (let variation of orderItem.orderItemVariations) {
		for (let variationItem of variation.variationItems) {
			total += variation.count * variationItem.additionalCost
		}
	}

	return ((total + orderItem.product.price * orderItem.count) / 100).toFixed(2)
}

export function getGraphQLErrorCodes(
	response: ApolloQueryResult<any>
): ErrorCode[] {
	if (response.errors == null) {
		return []
	}

	const errorCodes: ErrorCode[] = []

	for (let error of response.errors) {
		if (error.extensions != null && error.extensions["code"] != null) {
			errorCodes.push(error.extensions["code"] as ErrorCode)
		}
	}

	return errorCodes
}

export function randomNumber(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min
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

	return {
		uuid: restaurantResource.uuid,
		name: restaurantResource.name,
		users,
		rooms
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
//#endregion
