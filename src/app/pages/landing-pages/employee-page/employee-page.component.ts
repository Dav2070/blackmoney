import { Component } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { UserRole } from "src/app/types"

@Component({
	templateUrl: "./employee-page.component.html",
	styleUrl: "./employee-page.component.scss",
	standalone: false
})
export class EmployeePageComponent {
	locale = this.localizationService.locale.employeePage
	uuid: string = null
	name: string = ""
	role: UserRole = "USER"

	constructor(
		private dataService: DataService,
		private apiService: ApiService,
		private localizationService: LocalizationService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		this.uuid = this.activatedRoute.snapshot.paramMap.get("uuid")

		await this.dataService.blackmoneyUserPromiseHolder.AwaitResult()

		const retrieveUserResponse = await this.apiService.retrieveUser(
			`
				name
				role
			`,
			{
				uuid: this.uuid
			}
		)

		if (retrieveUserResponse.data.retrieveUser == null) return

		this.name = retrieveUserResponse.data.retrieveUser.name
		this.role = retrieveUserResponse.data.retrieveUser.role
	}

	navigateBack() {
		this.router.navigate(["user", "employees"])
	}
}
