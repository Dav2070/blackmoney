import { OrderItem } from "../../OrderItem"
import { OrderItemType, DiscountType, OfferType } from "../../../types"
import { OrderItemVariation } from "../../OrderItemVariation"

/**
 * PriceCalculator
 * Berechnet Preise für OrderItems unter Berücksichtigung von Offers und Discounts
 */
export class PriceCalculator {
	/**
	 * Berechnet den Gesamtpreis eines OrderItems (inkl. count).
	 * Berücksichtigt: Offer (FIXED_PRICE oder DISCOUNT), Variationen, verschachtelte OrderItems.
	 */
	calculateTotalPrice(orderItem: OrderItem): number {
		if (!orderItem) return 0

		let price = 0

		// Für reguläre Produkte und diverse Items: Produktpreis × count + alle Variationen
		if (
			orderItem.type === OrderItemType.Product ||
			orderItem.type === OrderItemType.DiverseFood ||
			orderItem.type === OrderItemType.DiverseDrink ||
			orderItem.type === OrderItemType.DiverseOther
		) {
			// For diverse items use diversePrice, for regular products use product.price
			const itemPrice = orderItem.diversePrice ?? orderItem.product.price
			price = itemPrice * orderItem.count
			price += this.calculateVariationsPrice(orderItem)
		}
		// Für Menus und Specials: nur verschachtelte Items
		else {
			price = this.calculateNestedOrderItemsPrice(orderItem)
		}

		// Offer anwenden
		price = this.applyOffer(price, orderItem)

		return price
	}

	/**
	 * Berechnet den Discount (gesparter Betrag) für ein OrderItem.
	 * Der Discount ist die Differenz zwischen Preis ohne Offer und Preis mit Offer.
	 * Bei count > 1 ist der zurückgegebene Discount bereits für alle Items (nicht pro Stück).
	 */
	calculateDiscount(orderItem: OrderItem): number {
		if (!orderItem || !orderItem.offer) return 0

		// Preis ohne Offer berechnen
		const priceWithoutOffer = this.calculatePriceWithoutOffer(orderItem)

		// Preis mit Offer berechnen
		const priceWithOffer = this.calculateTotalPrice(orderItem)

		// Differenz ist der gesparte Betrag
		const discount = priceWithoutOffer - priceWithOffer

		return discount
	}

	/**
	 * Berechnet den Preis ohne Anwendung des Offers.
	 */
	private calculatePriceWithoutOffer(orderItem: OrderItem): number {
		if (!orderItem) return 0

		let price = 0

		// Für reguläre Produkte und diverse Items: Produktpreis × count + alle Variationen
		if (
			orderItem.type === OrderItemType.Product ||
			orderItem.type === OrderItemType.DiverseFood ||
			orderItem.type === OrderItemType.DiverseDrink ||
			orderItem.type === OrderItemType.DiverseOther
		) {
			// For diverse items use diversePrice, for regular products use product.price
			const itemPrice = orderItem.diversePrice ?? orderItem.product.price
			price = itemPrice * orderItem.count
			price += this.calculateVariationsPrice(orderItem)
		}
		// Für Menus und Specials: nur verschachtelte Items (haben bereits ihre counts)
		else {
			price = this.calculateNestedOrderItemsPrice(orderItem)
		}

		// KEIN Offer anwenden (das ist der Unterschied zu calculateTotalPrice)

		return price
	}

	/**
	 * Berechnet den Preis aller Variationen eines OrderItems.
	 */
	private calculateVariationsPrice(orderItem: OrderItem): number {
		if (
			!orderItem.orderItemVariations ||
			orderItem.orderItemVariations.length === 0
		) {
			return 0
		}

		let totalVariationPrice = 0

		for (let i = 0; i < orderItem.orderItemVariations.length; i++) {
			const variation = orderItem.orderItemVariations[i]
			const variationPrice = this.calculateSingleVariationPrice(variation)
			totalVariationPrice += variationPrice
		}

		return totalVariationPrice
	}

	/**
	 * Berechnet den Preis einer einzelnen OrderItemVariation.
	 */
	private calculateSingleVariationPrice(
		variation: OrderItemVariation
	): number {
		if (!variation || !variation.variationItems) {
			return 0
		}

		let variationPrice = 0
		const variationCount = variation.count

		// Summiere additionalCost aller VariationItems
		for (let i = 0; i < variation.variationItems.length; i++) {
			const item = variation.variationItems[i]
			variationPrice += item.additionalCost
		}

		return variationPrice * variationCount
	}

	/**
	 * Berechnet den Preis aller verschachtelten OrderItems (für Menus und Specials).
	 */
	private calculateNestedOrderItemsPrice(orderItem: OrderItem): number {
		if (!orderItem.orderItems || orderItem.orderItems.length === 0) {
			return 0
		}

		let totalNestedPrice = 0

		for (let i = 0; i < orderItem.orderItems.length; i++) {
			const nestedItem = orderItem.orderItems[i]

			// For diverse items use diversePrice, for regular products use product.price
			const itemPrice = nestedItem.diversePrice ?? nestedItem.product.price

			// Berechne Gesamtpreis für verschachtelte Items: (Produktpreis × count) + Variationen
			const totalItemPrice = itemPrice * nestedItem.count
			const variationPrice = this.calculateVariationsPrice(nestedItem)

			totalNestedPrice += totalItemPrice + variationPrice
		}

		return totalNestedPrice
	}

	/**
	 * Wendet ein Offer auf den Preis an.
	 * - FIXED_PRICE: überschreibt den bisherigen Preis komplett
	 * - DISCOUNT: reduziert den Preis (PERCENTAGE oder AMOUNT)
	 */
	private applyOffer(price: number, orderItem: OrderItem): number {
		if (!orderItem.offer) {
			return price
		}

		const offer = orderItem.offer
		const offerValue = offer.offerValue

		if (offer.offerType === "FIXED_PRICE") {
			// FIXED_PRICE überschreibt den gesamten Preis
			return offerValue * orderItem.count
		}

		if (offer.offerType === "DISCOUNT") {
			if (!offer.discountType) {
				return price
			}

			if (offer.discountType === "PERCENTAGE") {
				// Prozentsatz: reduziere um (offerValue%)
				const discountAmount = (price * offerValue) / 100
				return price - discountAmount
			}

			if (offer.discountType === "AMOUNT") {
				// Fester Betrag: reduziere um offerValue
				return price - offerValue
			}
		}

		return price
	}
}
