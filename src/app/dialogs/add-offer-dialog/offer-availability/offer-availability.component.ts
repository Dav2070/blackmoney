import { Component, Input, Output, EventEmitter } from "@angular/core"
import { Weekday } from "src/app/types"

export interface OfferAvailability {
	selectedWeekdays: Weekday[]
	startDate: string
	endDate: string
	startTime: string
	endTime: string
}

@Component({
	selector: "app-offer-availability",
	templateUrl: "./offer-availability.component.html",
	styleUrls: ["./offer-availability.component.scss"],
	standalone: false
})
export class OfferAvailabilityComponent {
	@Input() data: OfferAvailability = {
		selectedWeekdays: [],
		startDate: "",
		endDate: "",
		startTime: "",
		endTime: ""
	}
	@Input() loading: boolean = false
	@Input() locale: any

	@Output() dataChange = new EventEmitter<OfferAvailability>()

	weekdayOptions: { value: Weekday; label: string }[] = [
		{ value: "MONDAY", label: "Montag" },
		{ value: "TUESDAY", label: "Dienstag" },
		{ value: "WEDNESDAY", label: "Mittwoch" },
		{ value: "THURSDAY", label: "Donnerstag" },
		{ value: "FRIDAY", label: "Freitag" },
		{ value: "SATURDAY", label: "Samstag" },
		{ value: "SUNDAY", label: "Sonntag" }
	]

	selectAllWeekdays() {
		this.data.selectedWeekdays = [
			"MONDAY",
			"TUESDAY",
			"WEDNESDAY",
			"THURSDAY",
			"FRIDAY",
			"SATURDAY",
			"SUNDAY"
		]
		this.dataChange.emit(this.data)
	}

	toggleWeekday(weekday: Weekday) {
		const index = this.data.selectedWeekdays.indexOf(weekday)
		if (index === -1) {
			this.data.selectedWeekdays.push(weekday)
		} else {
			this.data.selectedWeekdays.splice(index, 1)
		}
		this.dataChange.emit(this.data)
	}

	isWeekdaySelected(weekday: Weekday): boolean {
		return this.data.selectedWeekdays.includes(weekday)
	}

	startDateChange(value: string) {
		this.data.startDate = value
		this.dataChange.emit(this.data)
	}

	endDateChange(value: string) {
		this.data.endDate = value
		this.dataChange.emit(this.data)
	}

	startTimeChange(value: string) {
		this.data.startTime = value
		this.dataChange.emit(this.data)
	}

	endTimeChange(value: string) {
		this.data.endTime = value
		this.dataChange.emit(this.data)
	}
}
