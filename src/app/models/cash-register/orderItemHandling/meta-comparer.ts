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

		// strict check for Specials: only product of subitem must match
		if (
			existing.type === OrderItemType.Special &&
			incoming.type === OrderItemType.Special
		) {
			if (
				existing.orderItems[0].product.id !==
				incoming.orderItems[0].product.id
			)
				return false
		}

		// strict subitem/variation check only for Menu types
		if (
			existing.type === OrderItemType.Menu &&
			incoming.type === OrderItemType.Menu
		) {
			const aSubs = existing.orderItems ?? []
			const bSubs = incoming.orderItems ?? []
			return this.areOrderItemsArrayEqualForMerge(
				aSubs,
				bSubs,
				existing.count,
				incoming.count
			)
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
		bSubs: OrderItem[],
		parentExistingOrderItemCount: number,
		parentIncomingOrderItemCount: number
	): boolean {
		// Parent-Counts müssen gesetzt und > 0 sein (sonst Fehler)
		if (!parentExistingOrderItemCount || !parentIncomingOrderItemCount) {
			throw new Error(
				"Parent counts must be > 0 for strict menu matching (existing / incoming)"
			)
		}

		// gleiche Anzahl voraussetzen
		if (aSubs.length !== bSubs.length) return false

		// markiert bereits verwendete Einträge in "aSubs"
		const used = new Array<boolean>(aSubs.length).fill(false)

		// für jedes incoming-Element suchen wir ein passendes, noch unbenutztes existing-Element
		for (const bItem of bSubs) {
			let matched = false
			for (let i = 0; i < aSubs.length; i++) {
				if (used[i]) continue
				const aItem = aSubs[i]

				// Basic meta
				if (!this.isOrderItemBasicEqual(aItem, bItem)) continue

				// Sub-Counts müssen gesetzt und > 0 sein
				const aCount = aItem.count ?? 0
				const bCount = bItem.count ?? 0
				if (!aCount || !bCount) {
					throw new Error(
						`Subitem counts must be > 0 for strict menu matching (aCount=${aCount}, bCount=${bCount})`
					)
				}

				// Proportionale Count-Prüfung mittels Cross-Multiplikation (vermeidet division / float-issues)
				// Vergleiche: aCount / parentExisting === bCount / parentIncoming  -> aCount * parentIncoming === bCount * parentExisting
				if (
					aCount * parentIncomingOrderItemCount !==
					bCount * parentExistingOrderItemCount
				) {
					continue
				}

				// Variationen strikt vergleichen (inkl. proportionaler counts)
				if (
					!this.isOrderItemVariationsStrictEqual(
						aItem,
						bItem,
						parentExistingOrderItemCount,
						parentIncomingOrderItemCount
					)
				)
					continue

				// Verschachtelte Subitems (rekursiv prüfen)
				const aNested = aItem.orderItems ?? []
				const bNested = bItem.orderItems ?? []
				if (aNested.length !== bNested.length) continue
				if (
					aNested.length > 0 &&
					!this.areOrderItemsArrayEqualForMerge(
						aNested,
						bNested,
						parentExistingOrderItemCount,
						parentIncomingOrderItemCount
					)
				)
					continue

				// Treffer: markiere und gehe zum nächsten incoming-Element
				used[i] = true
				matched = true
				break
			}

			if (!matched) return false
		}

		// Alle incoming-Elemente fanden ein passendes existing-Element.
		return true
	}

	// strict compare of two OrderItem's orderItemVariations arrays:
	// - same length
	// - for each variation in a exists a variation in b with identical variationItems (order-insensitive) AND identical proportional count
	private isOrderItemVariationsStrictEqual(
		aItem: OrderItem,
		bItem: OrderItem,
		parentExistingOrderItemCount: number,
		parentIncomingOrderItemCount: number
	): boolean {
		// Parent-Counts müssen gesetzt und > 0 sein
		if (!parentExistingOrderItemCount || !parentIncomingOrderItemCount) {
			throw new Error(
				"Parent counts must be > 0 for strict variation matching (existing / incoming)"
			)
		}

		const aVars = aItem.orderItemVariations ?? []
		const bVars = bItem.orderItemVariations ?? []
		if (aVars.length !== bVars.length) return false

		// copy of b to mark matched variations
		const bCopy = bVars.map(v => JSON.parse(JSON.stringify(v)))

		for (const aVar of aVars) {
			const aVarCount = aVar.count ?? 0
			if (!aVarCount) {
				throw new Error(
					`Variation count must be > 0 for strict matching (aVarCount=${aVarCount})`
				)
			}

			const idx = bCopy.findIndex(bVar => {
				const bVarCount = bVar.count ?? 0
				if (!bVarCount) {
					// Fehler statt silently skippen
					throw new Error(
						`Variation count must be > 0 for strict matching (bVarCount=${bVarCount})`
					)
				}

				// variation items structurally equal
				if (!this.variationComparer.isVariationItemEqual(aVar, bVar))
					return false

				// proportional counts vergleichen: aVar.count / parentExisting === bVar.count / parentIncoming
				return (
					aVarCount * parentIncomingOrderItemCount ===
					bVarCount * parentExistingOrderItemCount
				)
			})

			if (idx === -1) return false
			bCopy.splice(idx, 1)
		}
		return bCopy.length === 0
	}
}
