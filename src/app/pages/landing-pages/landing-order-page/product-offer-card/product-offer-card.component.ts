import { Component, Input, Output, EventEmitter } from "@angular/core"
import { Offer } from "src/app/models/Offer"
import { formatPrice } from "src/app/utils"
import { faPlus } from "@fortawesome/pro-regular-svg-icons"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-order-product-offer-card",
	templateUrl: "./product-offer-card.component.html",
	styleUrl: "./product-offer-card.component.scss",
	standalone: false
})
export class OrderProductOfferCardComponent {
	locale = this.localizationService.locale.landingOrderPage
	@Input() offer: Offer
	@Output() selectOffer = new EventEmitter<Offer>()

	faPlus = faPlus
	formatPrice = formatPrice

	constructor(private localizationService: LocalizationService) {}

	onCardClick() {
		console.log("Offer card clicked, emitting:", this.offer)
		this.selectOffer.emit(this.offer)
	}

	onAddClick(event: Event) {
		console.log("Offer add clicked, emitting:", this.offer)
		event.stopPropagation()
		this.selectOffer.emit(this.offer)
	}

	getOfferItems(): string {
		if (!this.offer.offerItems || this.offer.offerItems.length === 0) {
			return ""
		}
		return this.offer.offerItems
			.map(item => {
				const productNames = item.products.map(p => p.name).join("/")
				return `${item.name}: ${productNames}`
			})
			.join(", ")
	}

	getAvailability(): string {
		const parts: string[] = []

		// Wochentage
		if (this.offer.weekdays && this.offer.weekdays.length > 0) {
			parts.push(this.formatWeekdays(this.offer.weekdays))
		}

		// Datum
		if (this.offer.startDate || this.offer.endDate) {
			const dateFormat = new Intl.DateTimeFormat("de-DE", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric"
			})

			if (this.offer.startDate && this.offer.endDate) {
				const start = dateFormat.format(new Date(this.offer.startDate))
				const end = dateFormat.format(new Date(this.offer.endDate))
				parts.push(`${start} - ${end}`)
			} else if (this.offer.startDate) {
				parts.push(
					`ab ${dateFormat.format(new Date(this.offer.startDate))}`
				)
			} else if (this.offer.endDate) {
				parts.push(`bis ${dateFormat.format(new Date(this.offer.endDate))}`)
			}
		}

		// Uhrzeit
		if (this.offer.startTime || this.offer.endTime) {
			if (this.offer.startTime && this.offer.endTime) {
				parts.push(`${this.offer.startTime} - ${this.offer.endTime}`)
			} else if (this.offer.startTime) {
				parts.push(`ab ${this.offer.startTime}`)
			} else if (this.offer.endTime) {
				parts.push(`bis ${this.offer.endTime}`)
			}
		}

		return parts.join(" • ")
	}

	formatWeekdays(weekdays: string[]): string {
		if (!weekdays || weekdays.length === 0) return ""

		const weekdayMap: { [key: string]: string } = {
			MONDAY: "Mo",
			TUESDAY: "Di",
			WEDNESDAY: "Mi",
			THURSDAY: "Do",
			FRIDAY: "Fr",
			SATURDAY: "Sa",
			SUNDAY: "So"
		}

		const orderedWeekdays = [
			"MONDAY",
			"TUESDAY",
			"WEDNESDAY",
			"THURSDAY",
			"FRIDAY",
			"SATURDAY",
			"SUNDAY"
		]

		const sortedWeekdays = weekdays.sort(
			(a, b) => orderedWeekdays.indexOf(a) - orderedWeekdays.indexOf(b)
		)

		return sortedWeekdays.map(day => weekdayMap[day]).join(", ")
	}
}
