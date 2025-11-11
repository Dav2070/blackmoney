import { Component, NgZone } from "@angular/core"
import { DataService } from "src/app/services/data-service"

@Component({
	selector: "app-header",
	templateUrl: "./header.component.html",
	styleUrl: "./header.component.scss",
	standalone: false
})
export class HeaderComponent {
	timer: any
	currentDate: string = ""
	currentTime: string = ""

	constructor(
		public dataService: DataService,
		private ngZone: NgZone
	) {}

	ngOnInit() {
		this.ngZone.runOutsideAngular(() => {
			this.timer = setInterval(() => {
				this.ngZone.run(() => {
					let date = new Date()

					this.currentDate = date.toLocaleDateString()
					this.currentTime = `${date
						.getHours()
						.toString()
						.padStart(2, "0")}:${date
						.getMinutes()
						.toString()
						.padStart(2, "0")}:${date
						.getSeconds()
						.toString()
						.padStart(2, "0")}`
				})
			}, 1000)
		})
	}

	ngOnDestroy() {
		if (this.timer) {
			clearInterval(this.timer)
		}
	}
}
