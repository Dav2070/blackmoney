import { Component, NgZone, ViewChild } from "@angular/core"
import { ActivateRegisterDialogComponent } from "src/app/dialogs/activate-register-dialog/activate-register-dialog.component"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import {
	getGraphQLErrorCodes,
	navigateToStripeCheckout,
	showToast
} from "src/app/utils"

@Component({
	selector: "app-header",
	templateUrl: "./header.component.html",
	styleUrl: "./header.component.scss",
	standalone: false
})
export class HeaderComponent {
	locale = this.localizationService.locale.header
	timer: any
	currentDate: string = ""
	currentTime: string = ""

	//#region ActivateRegisterDialog
	@ViewChild("activateRegisterDialog")
	activateRegisterDialog: ActivateRegisterDialogComponent
	activateRegisterDialogLoading: boolean = false
	//#endregion

	constructor(
		public dataService: DataService,
		private apiService: ApiService,
		private localizationService: LocalizationService,
		private ngZone: NgZone
	) {}

	ngOnInit() {
		this.ngZone.runOutsideAngular(() => {
			this.timer = setInterval(() => {
				this.ngZone.run(() => {
					const date = new Date()

					this.currentDate = date.toLocaleDateString()
					this.currentTime = `${date
						.getHours()
						.toString()
						.padStart(2, "0")}:${date
						.getMinutes()
						.toString()
						.padStart(2, "0")}:${date
						.getSeconds()
						.toString()
						.padStart(2, "0")}`
				})
			}, 1000)
		})
	}

	ngOnDestroy() {
		if (this.timer) {
			clearInterval(this.timer)
		}
	}

	showActivateRegisterDialog() {
		this.activateRegisterDialog.show()
	}

	async activateRegisterDialogPrimaryButtonClick() {
		this.activateRegisterDialogLoading = true

		const activateRegisterResponse = await this.apiService.activateRegister(
			`status`,
			{ uuid: this.dataService.register.uuid }
		)

		if (activateRegisterResponse.data?.activateRegister != null) {
			this.dataService.register.status =
				activateRegisterResponse.data.activateRegister.status
			showToast(this.locale.activationSuccess)
		} else {
			const errors = getGraphQLErrorCodes(activateRegisterResponse)
			if (errors == null) return

			if (errors.includes("REGISTER_ALREADY_ACTIVE")) {
				this.dataService.register.status = "ACTIVE"
			} else if (errors.includes("NO_ACTIVE_SUBSCRIPTION")) {
				await navigateToStripeCheckout(this.apiService)
			} else {
				showToast(this.locale.activationError)
			}
		}

		this.activateRegisterDialog.hide()
	}
}
