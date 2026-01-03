import { OrderItemType } from "src/app/types"
import { OrderItem } from "../../OrderItem"
import { OrderItemVariation } from "../../OrderItemVariation"
import { VariationComparer } from "./variation-comparer"
import { OrderItemMerger } from "./order-item-merger"

export class OrderItemsArrayMerger {
	private readonly variationComparer = new VariationComparer()

	// Merge alle orderItems von incoming in existing.orderItems (fügt zusammen oder hängt an)
	mergeOrderItemArray(existing: OrderItem, incoming: OrderItem) {
		if (!incoming?.orderItems?.length) return
		if (!existing.orderItems) existing.orderItems = []

		// Spezialbehandlung für Specials: nur ein Subitem, das gemerged wird
		if (
			incoming.type === OrderItemType.Special ||
			existing.type === OrderItemType.Special
		) {
			const orderItemMerger = new OrderItemMerger(existing.orderItems)
			// standard merge vom subitem, muss nicht gesucht werden, da es nur eins geben kann
			orderItemMerger.mergeIntoExisting(
				existing.orderItems[0],
				incoming.orderItems[0]
			)
		}
		//Wenn OrderItemType === Menu
		else {
			for (const incItem of incoming.orderItems) {
				const match = this.findMergeTarget(existing, incItem)
				if (match) {
					// vorhandenes Subitem mergen
					this.mergeOrderItem(match, incItem)
				}
			}
		}
	}

	// Findet ein Subitem in existing.orderItems das mit incomingItem gemerged werden kann
	findMergeTarget(
		existing: OrderItem,
		incomingItem: OrderItem
	): OrderItem | undefined {
		if (!existing?.orderItems?.length) return undefined

		for (const e of existing.orderItems) {
			if (this.isOrderItemEqual(e, incomingItem)) return e
		}
		return undefined
	}

	// Prüft, ob zwei OrderItems als gleich gelten (ohne count - count wird beim merge addiert)
	// Vergleich: type, offer, product, note, discount, takeAway, course, variation-structure, nested orderItems (rekursiv, order-insensitive)
	isOrderItemEqual(a: OrderItem, b: OrderItem): boolean {
		if (!a || !b) return false

		if (a.type !== b.type) return false
		if (a.notes !== b.notes) return false
		if (a.discount !== b.discount) return false
		if (a.takeAway !== b.takeAway) return false
		if (a.course !== b.course) return false
		if (a.offer?.id !== b.offer?.id) return false
		if (a.product.shortcut !== b.product.shortcut) return false

		// Variations: Struktur (variationItems) muss gleich sein (counts dürfen abweichen)
		if (
			!this.areVariationStructuresEqual(
				a.orderItemVariations ?? [],
				b.orderItemVariations ?? []
			)
		)
			return false

		// Nested orderItems: order-insensitive, rekursiv prüfen (ohne count check hier, da count beim merge addiert)
		const aSubs = a.orderItems ?? []
		const bSubs = b.orderItems ?? []
		if (aSubs.length !== bSubs.length) return false

		const matchedB = new Array<boolean>(bSubs.length).fill(false)
		for (const aSub of aSubs) {
			let found = false
			for (let j = 0; j < bSubs.length; j++) {
				if (matchedB[j]) continue
				const bSub = bSubs[j]
				// rekursiver Vergleich (gleiche Meta + variation-structure + nested)
				if (this.isOrderItemEqual(aSub, bSub)) {
					matchedB[j] = true
					found = true
					break
				}
			}
			if (!found) return false
		}

		return true
	}

	// Merge incoming in existing: counts addieren, variationen mergen, verschachtelte orderItems ebenfalls mergen/anhängen
	mergeOrderItem(existing: OrderItem, incoming: OrderItem): void {
		// addiere count
		existing.count = (existing.count ?? 0) + (incoming.count ?? 0)

		// merge top-level variations
		this.variationComparer.mergeOrAddVariations(existing, incoming)

		// merge nested orderItems (rekursiv)
		if (incoming.orderItems?.length) {
			if (!existing.orderItems) existing.orderItems = []
			for (const incSub of incoming.orderItems) {
				const match = this.findMergeTarget(
					{ orderItems: existing.orderItems } as any as OrderItem,
					incSub
				)
				if (match) {
					// found matching subitem -> merge recursively
					this.mergeOrderItem(match, incSub)
				} else {
					// push clone
					existing.orderItems.push(this.cloneOrderItem(incSub))
				}
			}
		}
	}

	// Vergleicht zwei orderItemVariations-Arrays auf Struktur-Gleichheit (variationItems identisch, Reihenfolge irrelevant).
	// Counts dürfen unterschiedlich sein.
	private areVariationStructuresEqual(
		aVars: OrderItemVariation[],
		bVars: OrderItemVariation[]
	): boolean {
		if (aVars.length !== bVars.length) return false
		// copy of b to mark matches
		const bCopy = bVars.map(v => structuredClone(v))
		for (const aVar of aVars) {
			const idx = bCopy.findIndex(bVar =>
				this.variationComparer.isVariationItemEqual(aVar, bVar)
			)
			if (idx === -1) return false
			bCopy.splice(idx, 1)
		}
		return bCopy.length === 0
	}

	// Einfacher tiefen-Klon
	private cloneOrderItem<T extends OrderItem>(item: T): T {
		return structuredClone(item)
	}
}
