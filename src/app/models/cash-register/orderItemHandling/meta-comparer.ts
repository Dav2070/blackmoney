import { OrderItem } from "../../OrderItem"

export class MetaComparer {
	// Prüft Product/Special-Meta (Note, TakeAway, Course, Offer-UUID wenn vorhanden)
	isSimpleMetaEqual(a: OrderItem, b: OrderItem): boolean {
		if (a.type !== b.type) return false
		if (a.product?.id !== b.product?.id) return false
		if ((a.note ?? "") !== (b.note ?? "")) return false
		if ((a.takeAway ?? false) !== (b.takeAway ?? false)) return false
		if ((a.course ?? null) !== (b.course ?? null)) return false
		if (a.offer?.uuid && b.offer?.uuid && a.offer.uuid !== b.offer.uuid)
			return false
		return true
	}

	// Prüft Composite-Meta (Basis-Meta + optionale Substruktur-Check wird außerhalb delegiert)
	isCompositeBaseMetaEqual(a: OrderItem, b: OrderItem): boolean {
		if (a.type !== b.type) return false
		if (a.product?.id !== b.product?.id) return false
		if ((a.note ?? "") !== (b.note ?? "")) return false
		if ((a.takeAway ?? false) !== (b.takeAway ?? false)) return false
		if ((a.course ?? null) !== (b.course ?? null)) return false
		if (a.offer?.uuid && b.offer?.uuid && a.offer.uuid !== b.offer.uuid)
			return false
		return true
	}

	// Minimaler Fallback-Identitätscheck
	isBasicIdentityEqual(a: OrderItem, b: OrderItem): boolean {
		return (
			a.product?.id === b.product?.id && (a.note ?? "") === (b.note ?? "")
		)
	}
}
