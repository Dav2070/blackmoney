import { Component, ViewChild } from "@angular/core"
import { AddEmployeeDialogComponent } from "src/app/dialogs/add-employee-dialog/add-employee-dialog.component"
import { User } from "src/app/models/User"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { convertUserResourceToUser } from "src/app/utils"

@Component({
	templateUrl: "./employees-page.component.html",
	styleUrl: "./employees-page.component.scss",
	standalone: false
})
export class EmployeesPageComponent {
	locale = this.localizationService.locale.employeesPage
	users: User[] = []
	nameError: string = ""

	//#region AddEmployeeDialog
	@ViewChild("addEmployeeDialog")
	addEmployeeDialog: AddEmployeeDialogComponent
	addEmployeeDialogLoading: boolean = false
	//#endregion

	constructor(
		private apiService: ApiService,
		private dataService: DataService,
		private localizationService: LocalizationService
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

	showAddEmployeeDialog() {
		this.addEmployeeDialog.show()
	}

	addEmployeeDialogPrimaryButtonClick(event: { name: string }) {
		console.log(event)
	}
}
