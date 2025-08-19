import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { Restaurant } from "src/app/models/Restaurant"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { convertRestaurantResourceToRestaurant } from "src/app/utils"

@Component({
	templateUrl: "./restaurants-page.component.html",
	styleUrl: "./restaurants-page.component.scss",
	standalone: false
})
export class RestaurantsPageComponent {
	locale = this.localizationService.locale.restaurantsPage
	restaurants: Restaurant[] = []
	loading: boolean = true

	constructor(
		private apiService: ApiService,
		private dataService: DataService,
		private localizationService: LocalizationService,
		private router: Router
	) {}

	async ngOnInit() {
		await this.dataService.blackmoneyUserPromiseHolder.AwaitResult()

		let retrieveCompanyResponse = await this.apiService.retrieveCompany(
			`
				restaurants {
					total
					items {
						uuid
						name
					}
				}
			`
		)

		if (retrieveCompanyResponse.data == null) return

		const restaurants =
			retrieveCompanyResponse.data.retrieveCompany.restaurants.items

		for (let restaurant of restaurants) {
			this.restaurants.push(
				convertRestaurantResourceToRestaurant(restaurant)
			)
		}

		this.loading = false
	}

	navigateBack() {
		this.router.navigate(["user"])
	}

	navigateToRestaurant(event: MouseEvent, restaurant: Restaurant) {
		event.preventDefault()

		this.router.navigate(["user", "restaurants", restaurant.uuid])
	}
}
