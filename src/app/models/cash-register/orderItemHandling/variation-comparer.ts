import { OrderItem } from "../../OrderItem"
import { OrderItemVariation } from "../../OrderItemVariation"

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
				existing.orderItemVariations.push(
					JSON.parse(JSON.stringify(incVar))
				)
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
	// contain the same item ids/uuids (count and variation/variation-uuid ignored).
	isVariationItemEqual(a: OrderItemVariation, b: OrderItemVariation): boolean {
		const aItems = (a?.variationItems ?? []).map(
			vi => (vi as any)?.id ?? (vi as any)?.uuid ?? String(vi)
		)
		const bItems = (b?.variationItems ?? []).map(
			vi => (vi as any)?.id ?? (vi as any)?.uuid ?? String(vi)
		)

		if (aItems.length !== bItems.length) return false

		aItems.sort()
		bItems.sort()

		for (let i = 0; i < aItems.length; i++) {
			if (aItems[i] !== bItems[i]) return false
		}
		return true
	}
}
