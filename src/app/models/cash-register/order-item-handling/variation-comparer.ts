import { Order } from "../../Order"
import { OrderItem } from "../../OrderItem"
import { OrderItemVariation } from "../../OrderItemVariation"
import { VariationItem } from "../../VariationItem"

export class VariationComparer {
	// Merge each incoming variation into existing.orderItemVariations:
	// - if a variation with identical variationItems exists -> increase its count
	// - otherwise push a clone of the incoming variation
	mergeOrAddVariations(existing: OrderItem, incoming: OrderItem) {
		if (!incoming?.orderItemVariations?.length) return
		if (!existing.orderItemVariations) existing.orderItemVariations = []

		for (const incVar of incoming.orderItemVariations) {
			const match = this.findMergeTarget(existing, incVar)
			if (match) {
				match.count += incVar.count
			} else {
				// push deep copy to avoid mutating incoming
				existing.orderItemVariations.push(structuredClone(incVar))
			}
		}
	}

	// Find a variation in existing that matches incomingVar (based on variationItems content)
	findMergeTarget(
		existing: OrderItem,
		incomingVar: OrderItemVariation
	): OrderItemVariation | undefined {
		if (!existing?.orderItemVariations?.length) return undefined
		for (const variation of existing.orderItemVariations) {
			if (this.isVariationItemEqual(variation, incomingVar)) {
				return variation
			}
		}
		return undefined
	}

	// Two OrderItemVariation are considered equal if their variationItems arrays
	// contain the same item ids (count and variation-uuid ignored).
	isVariationItemEqual(a: OrderItemVariation, b: OrderItemVariation): boolean {
		const aItems = (a?.variationItems ?? []).map(vi => vi.id)
		const bItems = (b?.variationItems ?? []).map(vi => vi.id)

		if (aItems.length !== bItems.length) return false

		aItems.sort((a, b) => a - b)
		bItems.sort((a, b) => a - b)

		for (let i = 0; i < aItems.length; i++) {
			if (aItems[i] !== bItems[i]) return false
		}
		return true
	}

	/**
	 * Findet eine ähnliche OrderItemVariation in einem OrderItem basierend auf den übergebenen VariationItems
	 * @param orderItem Das OrderItem, in dem gesucht werden soll
	 * @param incomingVariationItems Die VariationItems, für die eine passende Variation gesucht wird
	 * @returns Die gefundene OrderItemVariation oder null
	 */
	findSimilarVariationItem(
		orderItem: OrderItem,
		incomingOrderItemVariation: OrderItemVariation
	): OrderItemVariation | null {
		if (
			!orderItem?.orderItemVariations ||
			orderItem.orderItemVariations.length === 0
		) {
			return null
		}

		console.log(
			"        🔍 findSimilarVariationItem - searching for:",
			incomingOrderItemVariation.variationItems
				?.map(v => `${v.name}(id:${v.id})`)
				.join(", ")
		)
		console.log("        Available variations in booked item:")
		for (const bookedVar of orderItem.orderItemVariations) {
			console.log(
				"          -",
				bookedVar.variationItems
					?.map(v => `${v.name}(id:${v.id})`)
					.join(", "),
				"uuid:",
				bookedVar.uuid
			)
		}

		// Verwende bestehende findMergeTarget Methode
		const result =
			this.findMergeTarget(orderItem, incomingOrderItemVariation) || null
		console.log(
			"        Result:",
			result ? `Found match with uuid ${result.uuid}` : "No match"
		)
		return result
	}
}
