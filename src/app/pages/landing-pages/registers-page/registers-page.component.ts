import { Component } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { Register } from "src/app/models/Register"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { convertRestaurantResourceToRestaurant } from "src/app/utils"

@Component({
	templateUrl: "./registers-page.component.html",
	styleUrl: "./registers-page.component.scss",
	standalone: false
})
export class RegistersPageComponent {
	locale = this.localizationService.locale.registersPage
	uuid: string = null
	loading: boolean = true
	registers: Register[] = []

	constructor(
		private dataService: DataService,
		private apiService: ApiService,
		private localizationService: LocalizationService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		this.uuid = this.activatedRoute.snapshot.paramMap.get("uuid")

		await this.dataService.davUserPromiseHolder.AwaitResult()

		const retrieveRestaurantResponse =
			await this.apiService.retrieveRestaurant(
				`
					registers {
						items {
							uuid
							name
						}
					}
				`,
				{ uuid: this.uuid }
			)

		this.loading = false

		const retrieveRestaurantResponseData =
			convertRestaurantResourceToRestaurant(
				retrieveRestaurantResponse.data.retrieveRestaurant
			)

		if (retrieveRestaurantResponseData == null) return

		for (const register of retrieveRestaurantResponseData.registers) {
			this.registers.push(register)
		}
	}

	navigateBack() {
		this.router.navigate(["user", "restaurants", this.uuid])
	}

	navigateToRegisterPage(event: MouseEvent, register: Register) {
		event.preventDefault()

		this.router.navigate([
			"user",
			"restaurants",
			this.uuid,
			"registers",
			register.uuid
		])
	}
}
