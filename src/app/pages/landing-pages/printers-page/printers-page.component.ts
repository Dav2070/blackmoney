import { Component, ViewChild } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { faPen, faPrint } from "@fortawesome/pro-regular-svg-icons"
import { Toast } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"
import { DataService } from "src/app/services/data-service"
import { ApiService } from "src/app/services/api-service"
import { Printer } from "src/app/models/Printer"
import { EpsonPrinter } from "src/app/models/EpsonPrinter"
import { AddPrinterDialogComponent } from "src/app/dialogs/add-printer-dialog/add-printer-dialog.component"
import { EditPrinterDialogComponent } from "src/app/dialogs/edit-printer-dialog/edit-printer-dialog.component"
import {
	convertPrinterResourceToPrinter,
	convertRestaurantResourceToRestaurant,
	getGraphQLErrorCodes
} from "src/app/utils"
import * as ErrorCodes from "src/app/errorCodes"

@Component({
	selector: "app-printers-page",
	templateUrl: "./printers-page.component.html",
	styleUrl: "./printers-page.component.scss",
	standalone: false
})
export class PrintersPageComponent {
	locale = this.localizationService.locale.printersPage
	errorsLocale = this.localizationService.locale.errors
	faPen = faPen
	faPrint = faPrint
	uuid: string = null
	loading: boolean = true
	printers: { printer: Printer; epsonPrinter: EpsonPrinter }[] = []
	printerTestLoading: string = null

	//#region Add-Dialog Properties
	addPrinterDialogLoading = false
	addPrinterDialogNameError = ""
	addPrinterDialogIpAddressError = ""
	//#endregion

	//#region Edit-Dialog Properties
	editPrinterDialogLoading = false
	editPrinterDialogNameError = ""
	editPrinterDialogIpAddressError = ""
	editPrinterDialogUuid: string = null
	editPrinterDialogName = ""
	editPrinterDialogIpAddress = ""
	//#endregion

	@ViewChild("addPrinterDialog") addPrinterDialog!: AddPrinterDialogComponent
	@ViewChild("editPrinterDialog")
	editPrinterDialog!: EditPrinterDialogComponent

	constructor(
		private localizationService: LocalizationService,
		private dataService: DataService,
		private apiService: ApiService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		this.uuid = this.activatedRoute.snapshot.paramMap.get("uuid")

		await this.dataService.davUserPromiseHolder.AwaitResult()

		const retrieveRestaurantResponse =
			await this.apiService.retrieveRestaurant(
				`
					printers {
						items {
							uuid
							name
							ipAddress
						}
					}
				`,
				{ uuid: this.uuid }
			)

		this.loading = false

		const retrieveRestaurantResponseData =
			convertRestaurantResourceToRestaurant(
				retrieveRestaurantResponse.data.retrieveRestaurant
			)
		if (retrieveRestaurantResponseData == null) return

		for (let printer of retrieveRestaurantResponseData.printers) {
			this.printers.push({
				printer: {
					uuid: printer.uuid,
					name: printer.name,
					ipAddress: printer.ipAddress
				},
				epsonPrinter: new EpsonPrinter(printer.ipAddress)
			})
		}

		this.loadPrinterStatus()
	}

	async loadPrinterStatus() {
		for (const p of this.printers) {
			p.epsonPrinter.connect()
		}
	}

	showAddPrinterDialog() {
		this.clearAddPrinterDialogErrors()
		this.addPrinterDialog.show()
	}

	async addPrinterDialogPrimaryButtonClick(event: {
		name: string
		ipAddress: string
	}) {
		// Validierung
		if (event.name.length === 0) {
			this.addPrinterDialogNameError = this.errorsLocale.nameMissing
			return
		}

		if (event.ipAddress.length === 0) {
			this.addPrinterDialogIpAddressError =
				this.errorsLocale.ipAddressMissing
			return
		}

		this.addPrinterDialogLoading = true

		const createPrinterResponse = await this.apiService.createPrinter(
			`
				uuid
				name
				ipAddress
			`,
			{
				restaurantUuid: this.uuid,
				name: event.name,
				ipAddress: event.ipAddress
			}
		)

		this.addPrinterDialogLoading = false

		if (createPrinterResponse.data?.createPrinter != null) {
			const responseData = createPrinterResponse.data.createPrinter

			this.printers.push({
				printer: convertPrinterResourceToPrinter(responseData),
				epsonPrinter: new EpsonPrinter(responseData.ipAddress)
			})

			this.addPrinterDialog.hide()
		} else {
			const errors = getGraphQLErrorCodes(createPrinterResponse)
			if (errors == null) return

			for (const errorCode of errors) {
				switch (errorCode) {
					case ErrorCodes.nameTooShort:
						this.addPrinterDialogNameError =
							this.errorsLocale.nameTooShort
						break
					case ErrorCodes.nameTooLong:
						this.addPrinterDialogNameError = this.errorsLocale.nameTooLong
						break
					case ErrorCodes.ipAddressInvalid:
						this.addPrinterDialogIpAddressError =
							this.errorsLocale.ipAddressInvalid
						break
					case ErrorCodes.printerAlreadyExists:
						this.addPrinterDialogIpAddressError =
							this.errorsLocale.printerAlreadyExists
						break
					default:
						this.addPrinterDialogNameError =
							this.errorsLocale.unexpectedError
						break
				}
			}
		}
	}

	clearAddPrinterDialogErrors() {
		this.addPrinterDialogNameError = ""
		this.addPrinterDialogIpAddressError = ""
	}

	showEditPrinterDialog(printer: Printer) {
		this.clearEditPrinterDialogErrors()

		this.editPrinterDialogUuid = printer.uuid
		this.editPrinterDialogName = printer.name
		this.editPrinterDialogIpAddress = printer.ipAddress

		this.editPrinterDialog.show({
			name: printer.name,
			ipAddress: printer.ipAddress
		})
	}

	async editPrinterDialogPrimaryButtonClick(event: {
		name: string
		ipAddress: string
	}) {
		if (this.editPrinterDialogUuid == null) return

		// Validierung
		if (event.name.length === 0) {
			this.editPrinterDialogNameError = this.errorsLocale.nameMissing
			return
		}

		if (event.ipAddress.length === 0) {
			this.editPrinterDialogIpAddressError =
				this.errorsLocale.ipAddressMissing
			return
		}

		this.editPrinterDialogLoading = true

		const updatePrinterResponse = await this.apiService.updatePrinter(
			`
				uuid
				name
				ipAddress
			`,
			{
				uuid: this.editPrinterDialogUuid,
				name: event.name,
				ipAddress: event.ipAddress
			}
		)

		this.editPrinterDialogLoading = false

		if (updatePrinterResponse.data?.updatePrinter != null) {
			const responseData = updatePrinterResponse.data.updatePrinter

			const i = this.printers.findIndex(
				p => p.printer.uuid == responseData.uuid
			)

			if (i !== -1) {
				this.printers[i] = {
					printer: convertPrinterResourceToPrinter(responseData),
					epsonPrinter: new EpsonPrinter(responseData.ipAddress)
				}
			}

			this.editPrinterDialog.hide()
		} else {
			const errors = getGraphQLErrorCodes(updatePrinterResponse)
			if (errors == null) return

			for (const errorCode of errors) {
				switch (errorCode) {
					case ErrorCodes.nameTooShort:
						this.editPrinterDialogNameError =
							this.errorsLocale.nameTooShort
						break
					case ErrorCodes.nameTooLong:
						this.editPrinterDialogNameError =
							this.errorsLocale.nameTooLong
						break
					case ErrorCodes.ipAddressInvalid:
						this.editPrinterDialogIpAddressError =
							this.errorsLocale.ipAddressInvalid
						break
					case ErrorCodes.printerAlreadyExists:
						this.editPrinterDialogIpAddressError =
							this.errorsLocale.printerAlreadyExists
						break
					default:
						this.editPrinterDialogNameError =
							this.errorsLocale.unexpectedError
						break
				}
			}
		}
	}

	clearEditPrinterDialogErrors() {
		this.editPrinterDialogNameError = ""
		this.editPrinterDialogIpAddressError = ""
	}

	async testPrinter(printer: Printer, epsonPrinter: EpsonPrinter) {
		this.printerTestLoading = printer.uuid

		const toast = document.createElement("dav-toast")
		toast.paddingBottom = this.dataService.isMobile ? 80 : 0

		try {
			epsonPrinter.printTestPage(printer.name)
			toast.text = this.locale.testPrintSuccess
		} catch (err) {
			toast.text = this.locale.testPrintError.replace(
				"{errorMessage}",
				err as string
			)
		}

		this.printerTestLoading = null
		Toast.show(toast)
	}

	navigateBack() {
		this.router.navigate(["user", "restaurants", this.uuid])
	}
}
