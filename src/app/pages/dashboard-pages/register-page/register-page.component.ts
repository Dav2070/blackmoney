import { Component } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { Register } from "src/app/models/Register"
import { RegisterClient } from "src/app/models/RegisterClient"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { convertRegisterResourceToRegister } from "src/app/utils"

@Component({
	templateUrl: "./register-page.component.html",
	standalone: false
})
export class RegisterPageComponent {
	restaurantUuid: string = null
	registerUuid: string = null
	register: Register = null
	registerClients: RegisterClient[] = []
	loading: boolean = true

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

		await this.dataService.blackmoneyUserPromiseHolder.AwaitResult()

		const retrieveRegisterResponse = await this.apiService.retrieveRegister(
			`
				uuid
				name
				registerClients {
					items {
						uuid
						name
						serialNumber
					}
				}
			`,
			{ uuid: this.registerUuid }
		)

		this.loading = false

		const retrieveRegisterResponseData = convertRegisterResourceToRegister(
			retrieveRegisterResponse.data.retrieveRegister
		)

		if (retrieveRegisterResponseData == null) return
		this.register = retrieveRegisterResponseData

		for (const registerClient of retrieveRegisterResponseData.registerClients) {
			this.registerClients.push(registerClient)
		}
	}

	navigateBack() {
		this.router.navigate([
			"user",
			"restaurants",
			this.restaurantUuid,
			"registers"
		])
	}

	navigateToRegisterClientPage(
		event: MouseEvent,
		registerClient: RegisterClient
	) {
		event.preventDefault()

		this.router.navigate([
			"user",
			"restaurants",
			this.restaurantUuid,
			"registers",
			this.registerUuid,
			"clients",
			registerClient.uuid
		])
	}
}
