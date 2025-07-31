import { Component } from "@angular/core"
import { User } from "src/app/models/User"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { convertUserResourceToUser } from "src/app/utils"

@Component({
	templateUrl: "./employees-page.component.html",
	styleUrl: "./employees-page.component.scss",
	standalone: false
})
export class EmployeesPageComponent {
	users: User[] = []

	constructor(
		private apiService: ApiService,
		private dataService: DataService
	) {}

	async ngOnInit() {
		await this.dataService.blackmoneyUserPromiseHolder.AwaitResult()

		let retrieveCompanyResponse = await this.apiService.retrieveCompany(
			`
				users {
					total
					items {
						uuid
						name
					}
				}
			`
		)

		if (retrieveCompanyResponse.data == null) return

		const users = retrieveCompanyResponse.data.retrieveCompany.users.items

		for (let user of users) {
			this.users.push(convertUserResourceToUser(user))
		}
	}
}
