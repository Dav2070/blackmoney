import { OrderItemVariation } from "../../OrderItemVariation"

export class VariationComparer {
	// Vergleicht zwei Variation-Definitionen (order-unabhängig)
	isSameDefinition(a: OrderItemVariation, b: OrderItemVariation): boolean {
		if (!a || !b) return false
		const aItems = a.variationItems ?? []
		const bItems = b.variationItems ?? []
		if (aItems.length !== bItems.length) return false

		const mapA = new Map<number, any>()
		for (const ai of aItems) mapA.set(ai.id, ai)

		for (const bi of bItems) {
			const ai = mapA.get(bi.id)
			if (!ai) return false
			if ((ai.name ?? "") !== (bi.name ?? "")) return false
			if ((ai.additionalCost ?? 0) !== (bi.additionalCost ?? 0)) return false
			if ((ai.uuid ?? "") !== (bi.uuid ?? "")) return false
		}
		return true
	}

	// Vergleich inkl. count (für exakte Menu-Checks)
	isSameWithCount(a: OrderItemVariation, b: OrderItemVariation): boolean {
		if ((a.count ?? 0) !== (b.count ?? 0)) return false
		return this.isSameDefinition(a, b)
	}

	// Klonen einer Variation (sicher gegen Referenzen)
	clone(variation: OrderItemVariation): OrderItemVariation {
		return {
			...variation,
			variationItems: variation.variationItems?.map(it => ({ ...it })) ?? []
		} as OrderItemVariation
	}

	// Merge-Helfer: erhöht count wenn gleich, sonst push
	mergeOrAdd(targetList: OrderItemVariation[], incoming: OrderItemVariation) {
		const existing = targetList.find(v => this.isSameDefinition(v, incoming))
		if (existing) {
			existing.count += incoming.count
		} else {
			targetList.push(this.clone(incoming))
		}
	}
}
