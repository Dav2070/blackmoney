import { Component, ViewChild } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { faEllipsis } from "@fortawesome/pro-regular-svg-icons"
import { EditRegisterClientNameDialogComponent } from "src/app/dialogs/edit-register-client-name-dialog/edit-register-client-name-dialog.component"
import {
	AddPrintRuleDialogComponent,
	SelectedPrintRuleType
} from "src/app/dialogs/add-print-rule-dialog/add-print-rule-dialog.component"
import { RegisterClient } from "src/app/models/RegisterClient"
import { PrintRule } from "src/app/models/PrintRule"
import { DataService } from "src/app/services/data-service"
import { ApiService } from "src/app/services/api-service"
import { LocalizationService } from "src/app/services/localization-service"
import {
	getGraphQLErrorCodes,
	convertRegisterClientResourceToRegisterClient,
	convertPrintRuleResourceToPrintRule
} from "src/app/utils"
import { CategoryType, PrintRuleType } from "src/app/types"
import * as ErrorCodes from "src/app/errorCodes"

const printRuleQueryData = `
	uuid
	type
	categoryType
	printers {
		items {
			uuid
			name
		}
	}
	categories {
		items {
			uuid
			name
		}
	}
	products {
		items {
			uuid
			name
		}
	}
`

@Component({
	templateUrl: "./register-client-page.component.html",
	styleUrl: "./register-client-page.component.scss",
	standalone: false
})
export class RegisterClientPageComponent {
	locale = this.localizationService.locale.registerClientPage
	errorsLocale = this.localizationService.locale.errors
	faEllipsis = faEllipsis
	restaurantUuid: string = null
	registerUuid: string = null
	registerClientUuid: string = null
	registerClient: RegisterClient = null
	printRules: PrintRule[] = []

	@ViewChild("editRegisterClientNameDialog")
	editRegisterClientNameDialog: EditRegisterClientNameDialogComponent
	editRegisterClientNameDialogName: string = ""
	editRegisterClientNameDialogNameError: string = ""
	editRegisterClientNameDialogLoading: boolean = false

	@ViewChild("addPrintRuleDialog")
	addPrintRuleDialog: AddPrintRuleDialogComponent
	addPrintRuleDialogLoading: boolean = false

	constructor(
		private dataService: DataService,
		private apiService: ApiService,
		private localizationService: LocalizationService,
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

		// Load the register client & print rules
		const retrieveRegisterClientResponse =
			await this.apiService.retrieveRegisterClient(
				`
					uuid
					name
					serialNumber
					printRules {
						items {
							${printRuleQueryData}
						}
					}
				`,
				{ uuid: this.registerClientUuid }
			)

		const retrieveRegisterClientResponseData =
			convertRegisterClientResourceToRegisterClient(
				retrieveRegisterClientResponse.data.retrieveRegisterClient
			)

		if (retrieveRegisterClientResponseData == null) return
		this.registerClient = retrieveRegisterClientResponseData

		this.printRules = []

		for (const printRule of this.registerClient.printRules) {
			this.printRules.push(printRule)
		}
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

	showEditRegisterClientNameDialog() {
		if (this.registerClient == null) return

		this.editRegisterClientNameDialogName = this.registerClient.name
		this.editRegisterClientNameDialogNameError = ""
		this.editRegisterClientNameDialog.show()
	}

	showAddPrintRuleDialog() {
		this.addPrintRuleDialog.show()
	}

	async editRegisterClientNameDialogPrimaryButtonClick(event: {
		name: string
	}) {
		const name = event.name.trim()

		if (name.length === 0) {
			this.editRegisterClientNameDialogNameError =
				this.errorsLocale.nameMissing
			return
		}

		this.editRegisterClientNameDialogLoading = true

		const updateRegisterClientResponse =
			await this.apiService.updateRegisterClient(
				`
					uuid
					name
					serialNumber
				`,
				{
					uuid: this.registerClient.uuid,
					name
				}
			)

		this.editRegisterClientNameDialogLoading = false

		if (updateRegisterClientResponse.data?.updateRegisterClient != null) {
			const responseData =
				updateRegisterClientResponse.data.updateRegisterClient
			this.registerClient =
				convertRegisterClientResourceToRegisterClient(responseData)
			this.editRegisterClientNameDialog.hide()
		} else {
			const errors = getGraphQLErrorCodes(updateRegisterClientResponse)
			if (errors == null) return

			for (const errorCode of errors) {
				switch (errorCode) {
					case ErrorCodes.nameTooShort:
						this.editRegisterClientNameDialogNameError =
							this.errorsLocale.nameTooShort
						break
					case ErrorCodes.nameTooLong:
						this.editRegisterClientNameDialogNameError =
							this.errorsLocale.nameTooLong
						break
					default:
						this.editRegisterClientNameDialogNameError =
							this.errorsLocale.unexpectedError
						break
				}
			}
		}
	}

	async addPrintRuleDialogPrimaryButtonClick(event: {
		printerUuids: string[]
		printRuleType: SelectedPrintRuleType
	}) {
		let printRuleType: PrintRuleType = "BILLS"
		let categoryType: CategoryType = null

		switch (event.printRuleType) {
			case "allDrinks":
				printRuleType = "CATEGORY_TYPE"
				categoryType = "DRINK"
				break
			case "allFood":
				printRuleType = "CATEGORY_TYPE"
				categoryType = "FOOD"
				break
			case "allFoodAndDrinks":
				printRuleType = "CATEGORY_TYPE"
				break
		}

		this.addPrintRuleDialogLoading = true

		const createPrintRuleResponse = await this.apiService.createPrintRule(
			printRuleQueryData,
			{
				registerClientUuid: this.registerClientUuid,
				type: printRuleType,
				categoryType,
				printerUuids: event.printerUuids
			}
		)

		this.addPrintRuleDialogLoading = false

		if (createPrintRuleResponse.data?.createPrintRule != null) {
			const responseData = convertPrintRuleResourceToPrintRule(
				createPrintRuleResponse.data.createPrintRule
			)

			this.printRules.push(responseData)
		}

		this.addPrintRuleDialog.hide()
	}

	getTextForPrintRule(printRule: PrintRule) {
		let type = this.locale.bills

		if (
			printRule.type === "CATEGORY_TYPE" &&
			printRule.categoryType == "DRINK"
		) {
			type = this.locale.drinks
		} else if (
			printRule.type === "CATEGORY_TYPE" &&
			printRule.categoryType == "FOOD"
		) {
			type = this.locale.food
		} else if (printRule.type === "CATEGORY_TYPE") {
			type = this.locale.foodAndDrinks
		}

		return this.locale.printRuleText.replace("{type}", type)
	}
}
