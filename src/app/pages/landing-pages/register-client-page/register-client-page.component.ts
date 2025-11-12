import { Component } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router"
import { RegisterClient } from "src/app/models/RegisterClient"
import { DataService } from "src/app/services/data-service"
import { ApiService } from "src/app/services/api-service"
import { convertRegisterClientResourceToRegisterClient } from "src/app/utils"

@Component({
	templateUrl: "./register-client-page.component.html",
	standalone: false
})
export class RegisterClientPageComponent {
	restaurantUuid: string = null
	registerUuid: string = null
	registerClientUuid: string = null
	registerClient: RegisterClient = null

	constructor(
		private dataService: DataService,
		private apiService: ApiService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		this.restaurantUuid =
			this.activatedRoute.snapshot.paramMap.get("restaurantUuid")
		this.registerUuid =
			this.activatedRoute.snapshot.paramMap.get("registerUuid")
		this.registerClientUuid =
			this.activatedRoute.snapshot.paramMap.get("registerClientUuid")

		await this.dataService.blackmoneyUserPromiseHolder.AwaitResult()

		const retrieveRegisterClientResponse =
			await this.apiService.retrieveRegisterClient(
				`
					name
					serialNumber
				`,
				{ uuid: this.registerClientUuid }
			)

		const retrieveRegisterClientResponseData =
			convertRegisterClientResourceToRegisterClient(
				retrieveRegisterClientResponse.data.retrieveRegisterClient
			)

		if (retrieveRegisterClientResponseData == null) return
		this.registerClient = retrieveRegisterClientResponseData
	}

	navigateBack() {
		this.router.navigate([
			"user",
			"restaurants",
			this.restaurantUuid,
			"registers",
			this.registerUuid
		])
	}
}
