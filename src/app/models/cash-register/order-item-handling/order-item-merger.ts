import { OrderItem } from "src/app/models/OrderItem"
import { VariationComparer } from "./variation-comparer"
import { MetaComparer } from "./meta-comparer"
import { OrderItemsArrayMerger } from "./orderItemsArray-item-merger"

/**
 * OrderItemMerger
 * - delegiert Meta-Prüfungen an MetaComparer
 * - delegiert Variation-Logik an VariationComparer
 * - delegiert Subitem-Prüfungen an ContainedItemComparer
 * - mergeIntoExisting gibt true zurück, wenn tatsächlich gemerged wurde
 */
export class OrderItemMerger {
	private readonly allItems: OrderItem[]
	private readonly variationComparer: VariationComparer
	private readonly metaComparer: MetaComparer
	private readonly orderItemsArrayMerger: OrderItemsArrayMerger

	constructor(allItemsRef: OrderItem[]) {
		this.allItems = allItemsRef
		this.variationComparer = new VariationComparer()
		this.metaComparer = new MetaComparer()
		this.orderItemsArrayMerger = new OrderItemsArrayMerger()
	}

	/**
	 * Findet ein Merge-Ziel oder gibt undefined zurück.
	 * Menüs und Specials werden strenger geprüft (keine fälschlichen merges nur wegen offerId).
	 */
	findMergeTarget(
		incoming: OrderItem,
		allItems?: OrderItem[]
	): OrderItem | null {
		const list = allItems ?? this.allItems

		for (const existing of list) {
			if (this.metaComparer.isOrderItemMetaEqual(existing, incoming)) {
				return existing
			}
		}

		return null
	}

	/**
	 * Versucht, incoming in existing zu mergen.
	 * Gibt true zurück, wenn ein Merge stattgefunden hat, sonst false.
	 */
	mergeIntoExisting(existing: OrderItem, incoming: OrderItem): void {
		existing.count += incoming.count

		// Discounts addieren beim Mergen
		if (incoming.discount) {
			existing.discount = (existing.discount ?? 0) + incoming.discount
		}

		this.orderItemsArrayMerger.mergeOrderItemArray(existing, incoming)
		this.variationComparer.mergeOrAddVariations(existing, incoming)
	}
}
