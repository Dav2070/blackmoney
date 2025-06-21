import { Component, Input, NgZone } from "@angular/core"
import { DataService } from "src/app/services/data-service"

@Component({
	selector: "app-header",
	templateUrl: "./header.component.html",
	styleUrl: "./header.component.scss",
	standalone: false
})
export class HeaderComponent {
	@Input()
	showButton: boolean = true
	timer: any
	currentDate: string = ""
	bediener: string = ""

	constructor(public dataService: DataService, private ngZone: NgZone) {}

	ngOnInit() {
		this.ngZone.runOutsideAngular(() => {
			this.timer = setInterval(() => {
				this.ngZone.run(() => {
					let date = new Date()
					this.currentDate = `${date.toLocaleDateString()} – ${date.getHours()}:${date
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
