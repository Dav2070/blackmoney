import { OrderItem } from "../../OrderItem"
import { VariationComparer } from "./variation-comparer"
import { OrderItemType } from "src/app/types"

export class MetaComparer {
	private readonly variationComparer = new VariationComparer()

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
			const aSubs = existing.orderItems
			const bSubs = incoming.orderItems

			return this.areOrderItemsArrayEqualForMerge(
				aSubs,
				bSubs,
				existing.count,
				incoming.count
			)
		}

		//Zusatz Vergleich für Diverse Artikel
		if (!this.isDiversOrderItemMetaEqual(existing, incoming)) {
			return false
		}

		return true
	}

	// basic equality: all fields except uuid, count, order, orderItemVariations
	isOrderItemBasicEqual(a: OrderItem, b: OrderItem): boolean {
		if (a === b) return true
		if (!a || !b) return false

		if (a.type !== b.type) return false
		if (a.notes !== b.notes) return false
		if (a.discount !== b.discount) return false
		if (a.takeAway !== b.takeAway) return false
		if (a.course !== b.course) return false
		if (a.offer?.id !== b.offer?.id) return false
		if (a.product.id !== b.product.id) return false

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
				const aCount = aItem.count
				const bCount = bItem.count
				if (!aCount || !bCount) {
					continue
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
		const bCopy = bVars.map(v => structuredClone(v))

		for (const aVar of aVars) {
			const aVarCount = aVar.count
			if (!aVarCount) {
				return false
			}

			const idx = bCopy.findIndex(bVar => {
				const bVarCount = bVar.count
				if (!bVarCount) {
					// Fehler statt silently skippen
					return false
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

	// Comparison for miscellaneous items: price and name is relevant
	private isDiversOrderItemMetaEqual(
		existing: OrderItem,
		incoming: OrderItem
	): boolean {
		if (existing.product.id == 0 && incoming.product.id == 0) {
			if (existing.product.price !== incoming.product.price) return false
			if (existing.product.name !== incoming.product.name) return false
		}
		return true
	}
}
