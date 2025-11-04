import { OrderItem } from "src/app/models/OrderItem"
import { OrderItemType } from "src/app/types"
import { VariationComparer } from "./variation-comparer"
import { ContainedItemComparer } from "./contained-item-comparer"
import { MetaComparer } from "./meta-comparer"

/**
 * OrderItemMerger
 * - delegiert Meta-Prüfungen an MetaComparer
 * - delegiert Variation-Logik an VariationComparer
 * - delegiert Subitem-Prüfungen an ContainedItemComparer
 * - mergeIntoExisting gibt true zurück, wenn tatsächlich gemerged wurde
 */
export class OrderItemMerger {
	private allItems: OrderItem[]
	private variationComparer: VariationComparer
	private containedComparer: ContainedItemComparer
	private metaComparer: MetaComparer

	constructor(allItemsRef: OrderItem[]) {
		this.allItems = allItemsRef
		this.variationComparer = new VariationComparer()
		this.containedComparer = new ContainedItemComparer(this.variationComparer)
		this.metaComparer = new MetaComparer()
	}

	/**
	 * Findet ein Merge-Ziel oder gibt undefined zurück.
	 * Menüs werden streng gehandhabt; Products und Specials als "simple" gleich behandelt.
	 */
	findMergeTarget(
		incoming: OrderItem,
		ignoreItem?: OrderItem
	): OrderItem | undefined {
		return this.allItems.find(existing => {
			if (ignoreItem && existing === ignoreItem) return false

			// Menüs: nur mit Menüs vergleichen (strikte Prüfung)
			if (incoming.type === OrderItemType.Menu) {
				if (existing.type !== OrderItemType.Menu) return false
				if (!this.metaComparer.isCompositeBaseMetaEqual(existing, incoming))
					return false
				return this.areMenuStructureEqual(existing, incoming)
			}

			// Simple items (Product + Special)
			if (this.isSimpleItem(incoming) && this.isSimpleItem(existing)) {
				return this.metaComparer.isSimpleMetaEqual(existing, incoming)
			}

			// Optionaler, bewusst einfacher Fallback
			return this.metaComparer.isBasicIdentityEqual(existing, incoming)
		})
	}

	/**
	 * Versucht, incoming in existing zu mergen.
	 * Gibt true zurück, wenn ein Merge stattgefunden hat, sonst false.
	 */
	mergeIntoExisting(existing: OrderItem, incoming: OrderItem): boolean {
		// Simple items: Product / Special
		if (this.isSimpleItem(existing) && this.isSimpleItem(incoming)) {
			this.mergeSimple(existing, incoming)
			return true
		}

		// Composite (Menu/Special) behandeln
		return this.mergeComposite(existing, incoming)
	}

	/* ------------------- Implementierungen ------------------- */

	private mergeSimple(existing: OrderItem, incoming: OrderItem): void {
		// Count erhöhen
		existing.count += incoming.count

		// Discount optional addieren (oder anders behandeln falls gewünscht)
		if (incoming.discount != null) {
			existing.discount = (existing.discount ?? 0) + incoming.discount
		}

		// Variationen mergen delegiert an VariationComparer
		if (incoming.orderItemVariations?.length) {
			if (!existing.orderItemVariations) existing.orderItemVariations = []
			for (const incVar of incoming.orderItemVariations) {
				this.variationComparer.mergeOrAdd(
					existing.orderItemVariations,
					incVar
				)
			}
		}
	}

	/**
	 * Composite-Merge:
	 * - Menu: nur merge wenn Substruktur exakt gleich -> true/false
	 * - Special: merge locker (Subitems mergen)
	 */
	private mergeComposite(existing: OrderItem, incoming: OrderItem): boolean {
		// Menü: strikt, nur wenn Struktur exakt gleich
		if (existing.type === OrderItemType.Menu) {
			// meta (Produkt/note/takeaway/...) sollte passen, Substruktur exakt vergleichen
			if (!this.metaComparer.isCompositeBaseMetaEqual(existing, incoming))
				return false
			if (!this.areMenuStructureEqual(existing, incoming)) return false

			existing.count += incoming.count
			if (incoming.discount != null) {
				existing.discount = (existing.discount ?? 0) + incoming.discount
			}
			return true
		}

		// Specials: lockerer Merge (Subitems werden zusammengeführt)
		if (!this.metaComparer.isCompositeBaseMetaEqual(existing, incoming)) {
			// meta mismatch -> kein merge
			return false
		}

		existing.count += incoming.count
		if (incoming.orderItems?.length) {
			if (!existing.orderItems) existing.orderItems = []
			for (const incSub of incoming.orderItems) {
				this.mergeOrAddContainedOrderItem(existing, incSub)
			}
		}
		if (incoming.discount != null) {
			existing.discount = (existing.discount ?? 0) + incoming.discount
		}
		return true
	}

	/* Merge / Add für enthaltene orderItems innerhalb von Specials/Menus */
	private mergeOrAddContainedOrderItem(
		parent: OrderItem,
		incomingSub: OrderItem
	) {
		const existingSub = (parent.orderItems ?? []).find(sub =>
			this.containedComparer.isSameContainedLoosely(sub, incomingSub)
		)
		if (existingSub) {
			existingSub.count += incomingSub.count
			if (incomingSub.orderItemVariations?.length) {
				if (!existingSub.orderItemVariations)
					existingSub.orderItemVariations = []
				for (const incVar of incomingSub.orderItemVariations) {
					this.variationComparer.mergeOrAdd(
						existingSub.orderItemVariations,
						incVar
					)
				}
			}
		} else {
			parent.orderItems.push({ ...incomingSub })
		}
	}

	/* Menüstruktur-Prüfung (exact) */
	private areMenuStructureEqual(a: OrderItem, b: OrderItem): boolean {
		const aSubs = a.orderItems ?? []
		const bSubs = b.orderItems ?? []
		return this.containedComparer.areSubItemListsEqual(aSubs, bSubs, true)
	}

	/* Helfer */
	private isSimpleItem(item: OrderItem): boolean {
		return (
			item.type === OrderItemType.Product ||
			item.type === OrderItemType.Special
		)
	}
}
