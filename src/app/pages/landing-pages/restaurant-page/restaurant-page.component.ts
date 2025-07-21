import { Component } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"

@Component({
	templateUrl: "./restaurant-page.component.html",
	styleUrl: "./restaurant-page.component.scss",
	standalone: false
})
export class RestaurantPageComponent {
	name: string = ""

	constructor(
		private apiService: ApiService,
		private dataService: DataService,
		private activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		const uuid = this.activatedRoute.snapshot.paramMap.get("uuid")

		await this.dataService.davUserPromiseHolder.AwaitResult()

		const retrieveRestaurantResponse =
			await this.apiService.retrieveRestaurant(`name`, { uuid })

		if (retrieveRestaurantResponse.data == null) return

		this.name = retrieveRestaurantResponse.data.retrieveRestaurant.name
	}
}
