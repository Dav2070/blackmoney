import { OrderItem } from "src/app/models/OrderItem"
import { VariationComparer } from "./variation-comparer"

/**
 * Vergleicht enthaltene OrderItems (z.B. Subitems in Menüs/Specials).
 * Nutzt VariationComparer für die Variation-Vergleiche.
 */
export class ContainedItemComparer {
	private variationComparer: VariationComparer

	constructor(variationComparer: VariationComparer) {
		this.variationComparer = variationComparer
	}

	// Lockerer Vergleich: Produkt-id + gleiche Variation-Definitions (ohne count)
	isSameContainedLoosely(aSub: OrderItem, bSub: OrderItem): boolean {
		if (aSub.product?.id !== bSub.product?.id) return false
		const aVars = aSub.orderItemVariations ?? []
		const bVars = bSub.orderItemVariations ?? []
		if (aVars.length !== bVars.length) return false
		return bVars.every(bv =>
			aVars.some(av => this.variationComparer.isSameDefinition(av, bv))
		)
	}

	// Exakter Vergleich: Produkt-id + gleiche Sub-count + Variationen inkl. count
	isSameContainedExact(aSub: OrderItem, bSub: OrderItem): boolean {
		if (aSub.product?.id !== bSub.product?.id) return false
		if ((aSub.count ?? 0) !== (bSub.count ?? 0)) return false
		const aVars = aSub.orderItemVariations ?? []
		const bVars = bSub.orderItemVariations ?? []
		if (aVars.length !== bVars.length) return false
		return bVars.every(bv =>
			aVars.some(av => this.variationComparer.isSameWithCount(av, bv))
		)
	}

	// Vergleicht zwei Listen von Subitems; exact entscheidet ob exact oder loose genutzt wird
	areSubItemListsEqual(
		aSubs: OrderItem[],
		bSubs: OrderItem[],
		exact = false
	): boolean {
		if ((aSubs?.length ?? 0) !== (bSubs?.length ?? 0)) return false
		if (exact) {
			return bSubs.every(b =>
				aSubs.some(a => this.isSameContainedExact(a, b))
			)
		}
		return bSubs.every(b =>
			aSubs.some(a => this.isSameContainedLoosely(a, b))
		)
	}
}
