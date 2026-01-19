import { Component, EventEmitter, Input, Output } from "@angular/core"
import { faEllipsis } from "@fortawesome/pro-regular-svg-icons"
import { Product } from "src/app/models/Product"
import { LocalizationService } from "src/app/services/localization-service"
import { Weekday } from "src/app/types"
import { formatPrice } from "src/app/utils"

@Component({
	selector: "app-offer-card",
	templateUrl: "./offer-card.component.html",
	styleUrl: "./offer-card.component.scss",
	standalone: false
})
export class OfferCardComponent {
	locale = this.localizationService.locale.offerCard
	actionsLocale = this.localizationService.locale.actions
	faEllipsis = faEllipsis
	formatPrice = formatPrice
	@Input() offer: Product = null
	@Output() optionsButtonClick = new EventEmitter()

	constructor(private localizationService: LocalizationService) {}

	formatAvailability(offer: any): string {
		const parts: string[] = []

		// Wochentage
		if (offer?.weekdays?.length > 0) {
			parts.push(this.formatWeekdays(offer.weekdays))
		}

		// Datum
		if (offer?.startDate || offer?.endDate) {
			const dateFormat = new Intl.DateTimeFormat("de-DE", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric"
			})

			const startDate = offer.startDate ? new Date(offer.startDate) : null
			const endDate = offer.endDate ? new Date(offer.endDate) : null
			const hasValidStartDate = startDate && !isNaN(startDate.getTime())
			const hasValidEndDate = endDate && !isNaN(endDate.getTime())

			if (hasValidStartDate && hasValidEndDate) {
				const start = dateFormat.format(startDate)
				const end = dateFormat.format(endDate)
				parts.push(`${start} - ${end}`)
			} else if (hasValidStartDate) {
				parts.push(`ab ${dateFormat.format(startDate)}`)
			} else if (hasValidEndDate) {
				parts.push(`bis ${dateFormat.format(endDate)}`)
			}
		}

		// Uhrzeit
		if (offer?.startTime || offer?.endTime) {
			if (offer.startTime && offer.endTime) {
				parts.push(`${offer.startTime} - ${offer.endTime}`)
			} else if (offer.startTime) {
				parts.push(`ab ${offer.startTime}`)
			} else if (offer.endTime) {
				parts.push(`bis ${offer.endTime}`)
			}
		}

		return parts.join(" • ")
	}

	formatWeekdays(weekdays: Weekday[]): string {
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

		// Erstelle eine Kopie des Arrays, bevor wir es sortieren
		const sortedWeekdays = [...weekdays].sort(
			(a, b) => orderedWeekdays.indexOf(a) - orderedWeekdays.indexOf(b)
		)

		return sortedWeekdays.map(day => weekdayMap[day]).join(", ")
	}
}
