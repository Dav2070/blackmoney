import { Component, EventEmitter, Input, Output } from "@angular/core"
import { faEllipsis } from "@fortawesome/pro-regular-svg-icons"
import { Product } from "src/app/models/Product"
import { LocalizationService } from "src/app/services/localization-service"
import { Weekday } from "src/app/types"

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

			if (offer.startDate && offer.endDate) {
				const start = dateFormat.format(new Date(offer.startDate))
				const end = dateFormat.format(new Date(offer.endDate))
				parts.push(`${start} - ${end}`)
			} else if (offer.startDate) {
				parts.push(`ab ${dateFormat.format(new Date(offer.startDate))}`)
			} else if (offer.endDate) {
				parts.push(`bis ${dateFormat.format(new Date(offer.endDate))}`)
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

		const sortedWeekdays = weekdays.sort(
			(a, b) => orderedWeekdays.indexOf(a) - orderedWeekdays.indexOf(b)
		)

		return sortedWeekdays.map(day => weekdayMap[day]).join(", ")
	}
}
