import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	templateUrl: "./reservations-page.component.html",
	styleUrl: "./reservations-page.component.scss",
	standalone: false
})
export class ReservationsPageComponent {
	locale = this.localizationService.locale.reservationsPage

	constructor(
		private dataService: DataService,
		private localizationService: LocalizationService,
		private router: Router
	) {}

	async ngOnInit() {
		await this.dataService.blackmoneyUserPromiseHolder.AwaitResult()
	}

	navigateBack() {
		this.router.navigate(["user"])
	}
}
