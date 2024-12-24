import { Injectable } from "@angular/core"
import { interval, map, timer } from "rxjs"

@Injectable({
	providedIn: "root"
})
export class TimeService {
	constructor() {}

	date = new Date()

	getDate() {
		return interval(1000).pipe(map(_ => this.getDateTime()))
	}

	// get new time by adding + sec
	private getDateTime() {
		this.date.setSeconds(this.date.getSeconds() + 1)
		return this.date.toLocaleString("de-DE")
	}
}
