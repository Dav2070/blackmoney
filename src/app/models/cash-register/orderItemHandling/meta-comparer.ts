import { OrderItem } from "../../OrderItem"
import { VariationComparer } from "./variation-comparer"
import { OrderItemType } from "src/app/types"

export class MetaComparer {
	private variationComparer = new VariationComparer()

	// Public entry: strikter Vergleich nur für Menus, sonst Basic-Check
	isOrderItemMetaEqual(existing: OrderItem, incoming: OrderItem): boolean {
		if (!existing || !incoming) return false

		// basic comparison (ignores uuid, count, order and orderItemVariations)
		if (!this.isOrderItemBasicEqual(existing, incoming)) return false

		// strict subitem/variation check only for Menu types
		if (
			existing.type === OrderItemType.Menu &&
			incoming.type === OrderItemType.Menu
		) {
			const aSubs = existing.orderItems ?? []
			const bSubs = incoming.orderItems ?? []
			return this.areOrderItemsArrayEqualForMerge(aSubs, bSubs)
		}

		return true
	}

	// basic equality: all fields except uuid, count, order, orderItemVariations
	isOrderItemBasicEqual(a: OrderItem, b: OrderItem): boolean {
		if (a === b) return true
		if (!a || !b) return false

		if (a.type !== b.type) return false
		if ((a.note ?? "") !== (b.note ?? "")) return false
		if ((a.discount ?? 0) !== (b.discount ?? 0)) return false
		if ((a.takeAway ?? false) !== (b.takeAway ?? false)) return false
		if ((a.course ?? 0) !== (b.course ?? 0)) return false

		const aOfferId = (a.offer as any)?.uuid ?? (a.offer as any)?.id ?? null
		const bOfferId = (b.offer as any)?.uuid ?? (b.offer as any)?.id ?? null
		if (aOfferId !== bOfferId) return false

		const aProductId =
			(a.product as any)?.id ?? (a.product as any)?.uuid ?? null
		const bProductId =
			(b.product as any)?.id ?? (b.product as any)?.uuid ?? null
		if (aProductId !== bProductId) return false

		return true
	}

	// order-insensitive deep compare for subitems used for strict Menu matching
	private areOrderItemsArrayEqualForMerge(
		aSubs: OrderItem[],
		bSubs: OrderItem[]
	): boolean {
		if (aSubs.length !== bSubs.length) return false

		const matchedB = new Array<boolean>(bSubs.length).fill(false)

		for (const aItem of aSubs) {
			let foundIndex = -1
			for (let j = 0; j < bSubs.length; j++) {
				if (matchedB[j]) continue
				const bItem = bSubs[j]

				// basic meta must match
				if (!this.isOrderItemBasicEqual(aItem, bItem)) continue

				// exact count match required for strict merge
				if ((aItem.count ?? 0) !== (bItem.count ?? 0)) continue

				// variations must be exactly equal (counts + variationItems)
				if (!this.isOrderItemVariationsStrictEqual(aItem, bItem)) continue

				// nested subitems: lengths must match and must be equal recursively
				const aNested = aItem.orderItems ?? []
				const bNested = bItem.orderItems ?? []
				if (aNested.length !== bNested.length) continue
				if (
					aNested.length > 0 &&
					!this.areOrderItemsArrayEqualForMerge(aNested, bNested)
				)
					continue

				foundIndex = j
				break
			}

			if (foundIndex === -1) return false
			matchedB[foundIndex] = true
		}

		return true
	}

	// strict compare of two OrderItem's orderItemVariations arrays:
	// - same length
	// - for each variation in a exists a variation in b with identical variationItems (order-insensitive) AND identical count
	private isOrderItemVariationsStrictEqual(
		aItem: OrderItem,
		bItem: OrderItem
	): boolean {
		const aVars = aItem.orderItemVariations ?? []
		const bVars = bItem.orderItemVariations ?? []
		if (aVars.length !== bVars.length) return false

		// copy of b to mark matched variations
		const bCopy = bVars.map(v => JSON.parse(JSON.stringify(v)))

		for (const aVar of aVars) {
			const idx = bCopy.findIndex(
				bVar =>
					this.variationComparer.isVariationItemEqual(aVar, bVar) &&
					(aVar.count ?? 0) === (bVar.count ?? 0)
			)
			if (idx === -1) return false
			bCopy.splice(idx, 1)
		}
		return bCopy.length === 0
	}
}
