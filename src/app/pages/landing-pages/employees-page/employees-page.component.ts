import { Component, ViewChild } from "@angular/core"
import { Router } from "@angular/router"
import { AddEmployeeDialogComponent } from "src/app/dialogs/add-employee-dialog/add-employee-dialog.component"
import { User } from "src/app/models/User"
import { Restaurant } from "src/app/models/Restaurant"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import {
	convertRestaurantResourceToRestaurant,
	convertUserResourceToUser,
	getGraphQLErrorCodes
} from "src/app/utils"
import * as ErrorCodes from "src/app/errorCodes"

@Component({
	templateUrl: "./employees-page.component.html",
	styleUrl: "./employees-page.component.scss",
	standalone: false
})
export class EmployeesPageComponent {
	locale = this.localizationService.locale.employeesPage
	errorsLocale = this.localizationService.locale.errors
	users: User[] = []
	restaurants: Restaurant[] = []
	nameError: string = ""
	loading: boolean = true

	//#region AddEmployeeDialog
	@ViewChild("addEmployeeDialog")
	addEmployeeDialog: AddEmployeeDialogComponent
	addEmployeeDialogLoading: boolean = false
	//#endregion

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
				users {
					total
					items {
						uuid
						name
					}
				}
				restaurants {
					items {
						uuid
						name
					}
				}
			`
		)

		this.loading = false

		if (retrieveCompanyResponse.data == null) return

		const users = retrieveCompanyResponse.data.retrieveCompany.users.items

		for (let user of users) {
			if (user.uuid !== this.dataService.user.uuid) {
				this.users.push(convertUserResourceToUser(user))
			}
		}

		const restaurants =
			retrieveCompanyResponse.data.retrieveCompany.restaurants.items

		for (let restaurant of restaurants) {
			this.restaurants.push(
				convertRestaurantResourceToRestaurant(restaurant)
			)
		}
	}

	showAddEmployeeDialog() {
		this.addEmployeeDialog.show()
	}

	navigateBack() {
		this.router.navigate(["user"])
	}

	navigateToEmployee(event: MouseEvent, user: User) {
		event.preventDefault()

		this.router.navigate(["user", "employees", user.uuid])
	}

	async addEmployeeDialogPrimaryButtonClick(event: {
		name: string
		restaurants: string[]
	}) {
		if (event.name.length === 0) {
			this.nameError = this.errorsLocale.nameMissing
			return
		}		

		this.addEmployeeDialogLoading = true

		const createUserResponse = await this.apiService.createUser(
			`
				uuid
				name
			`,
			{
				companyUuid: this.dataService.company.uuid,
				name: event.name,
				restaurants: event.restaurants
			}
		)

		this.addEmployeeDialogLoading = false

		if (createUserResponse.data?.createUser != null) {
			const responseData = createUserResponse.data.createUser

			this.users.push(convertUserResourceToUser(responseData))

			this.addEmployeeDialog.hide()
		} else {
			const errors = getGraphQLErrorCodes(createUserResponse)
			if (errors == null) return

			for (const errorCode of errors) {
				switch (errorCode) {
					case ErrorCodes.nameTooShort:
						this.nameError = this.errorsLocale.nameTooShort
						break
					case ErrorCodes.nameTooLong:
						this.nameError = this.errorsLocale.nameTooLong
						break
					default:
						this.nameError = this.errorsLocale.unexpectedError
						break
				}
			}
		}
	}
}
