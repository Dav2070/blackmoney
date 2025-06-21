import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { DropdownOption, DropdownOptionType } from "dav-ui-components"
import { ApiService } from "src/app/services/api-service"
import { AuthService } from "src/app/services/auth-service"
import { DataService } from "src/app/services/data-service"
import { convertUserResourceToUser } from "src/app/utils"

@Component({
	templateUrl: "./login-page.component.html",
	styleUrl: "./login-page.component.scss",
	standalone: false
})
export class LoginPageComponent {
	userDropdownOptions: DropdownOption[] = []
	userDropdownSelectedKey: string = ""
	username: string = ""
	password: string = ""
	errorMessage: string = ""

	constructor(
		private router: Router,
		public dataService: DataService,
		private apiService: ApiService,
		private authService: AuthService
	) {}

	async ngOnInit() {
		if (this.authService.getAccessToken() != null) {
			// Redirect to tables page
			this.router.navigate(["tables"])
			return
		}

		await this.dataService.restaurantPromiseHolder.AwaitResult()

		for (let user of this.dataService.restaurant.users) {
			this.userDropdownOptions.push({
				key: user.uuid,
				value: user.name,
				type: DropdownOptionType.option
			})
		}
	}

	userDropdownChange(event: Event) {
		this.userDropdownSelectedKey = (event as CustomEvent).detail.key
		let selectedUser = this.dataService.restaurant.users.find(
			u => u.uuid === this.userDropdownSelectedKey
		)
		this.username = selectedUser?.name ?? ""
	}

	passwordChange(event: Event) {
		this.password = (event as CustomEvent).detail.value
	}

	async login() {
		this.errorMessage = ""

		let loginResponse = await this.apiService.login(
			`
				uuid
				user {
					uuid
					name
					role
				}
			`,
			{
				restaurantUuid: this.dataService.restaurant.uuid,
				userName: this.username,
				password: this.password
			}
		)

		let accessToken = loginResponse?.data?.login.uuid

		if (accessToken != null) {
			this.authService.setAccessToken(accessToken)
			this.dataService.loadApollo(accessToken)

			this.dataService.user = convertUserResourceToUser(
				loginResponse.data.login.user
			)
			this.dataService.blackmoneyUserPromiseHolder.Resolve()

			// Redirect to tables page
			this.router.navigate(["tables"])
		} else {
			this.errorMessage = "Login failed"
		}
	}
}
