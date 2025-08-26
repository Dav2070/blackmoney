import { Component, ViewChild } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { faPen, faPrint } from "@fortawesome/pro-regular-svg-icons"
import { Toast } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"
import { PrinterService } from "src/app/services/printer-service"
import { DataService } from "src/app/services/data-service"
import { ApiService } from "src/app/services/api-service"
import { Printer } from "src/app/models/Printer"
import { AddPrinterDialogComponent } from "src/app/dialogs/add-printer-dialog/add-printer-dialog.component"
import { EditPrinterDialogComponent } from "src/app/dialogs/edit-printer-dialog/edit-printer-dialog.component"
import { convertRestaurantResourceToRestaurant } from "src/app/utils"

@Component({
	selector: "app-printers-page",
	templateUrl: "./printers-page.component.html",
	styleUrl: "./printers-page.component.scss",
	standalone: false
})
export class PrintersPageComponent {
	locale = this.localizationService.locale.printersPage
	faPen = faPen
	faPrint = faPrint
	uuid: string = null

	printers: Printer[] = []

	printerStatus: { [uuid: string]: "online" | "offline" | "loading" } = {}
	printerTestLoading: string = null

	// Add-Dialog Properties
	addPrinterDialogLoading = false
	addPrinterDialogNameError = ""
	addPrinterDialogIpAddressError = ""

	// Edit-Dialog Properties
	editPrinterDialogLoading = false
	editPrinterDialogNameError = ""
	editPrinterDialogIpAddressError = ""
	editPrinterDialogName = ""
	editPrinterDialogIpAddress = ""
	editPrinterDialogPrinterUuid: string | null = null

	@ViewChild("addPrinterDialog") addPrinterDialog!: AddPrinterDialogComponent
	@ViewChild("editPrinterDialog")
	editPrinterDialog!: EditPrinterDialogComponent

	constructor(
		private localizationService: LocalizationService,
		private printerService: PrinterService,
		private dataService: DataService,
		private apiService: ApiService,
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

		const retrieveRestaurantResponseData =
			convertRestaurantResourceToRestaurant(
				retrieveRestaurantResponse.data.retrieveRestaurant
			)
		if (retrieveRestaurantResponseData == null) return

		for (let printer of retrieveRestaurantResponseData.printers) {
			this.printers.push({
				uuid: printer.uuid,
				name: printer.name,
				ipAddress: printer.ipAddress
			})
		}

		this.loadPrinterStatus()
	}

	async loadPrinterStatus() {
		for (const printer of this.printers) {
			this.printerStatus[printer.uuid] = "loading" // Status auf "loading" setzen
			this.printerStatus[printer.uuid] =
				await this.printerService.getStatus(printer)
		}
	}

	showAddPrinterDialog() {
		this.clearAddPrinterDialogErrors()
		this.addPrinterDialog.show()
	}

	addPrinterDialogPrimaryButtonClick(event: {
		name: string
		ipAddress: string
	}) {
		this.addPrinterDialogLoading = true

		// Validierung
		if (event.name.length === 0) {
			this.addPrinterDialogNameError = "Name darf nicht leer sein."
			this.addPrinterDialogLoading = false
			return
		}

		if (event.ipAddress.length === 0) {
			this.addPrinterDialogIpAddressError =
				"IP-Adresse darf nicht leer sein."
			this.addPrinterDialogLoading = false
			return
		}

		// Drucker hinzufügen
		this.printers.push({
			uuid: (Math.random() * 1000000).toFixed(0),
			name: event.name,
			ipAddress: event.ipAddress
		})

		this.addPrinterDialogLoading = false
		this.addPrinterDialog.hide()
	}

	clearAddPrinterDialogErrors() {
		this.addPrinterDialogNameError = ""
		this.addPrinterDialogIpAddressError = ""
	}

	// --- Edit Dialog ---
	showEditPrinterDialog(printer: Printer) {
		this.clearEditPrinterDialogErrors()
		this.editPrinterDialogPrinterUuid = printer.uuid ?? null
		this.editPrinterDialogName = printer.name
		this.editPrinterDialogIpAddress = printer.ipAddress
		this.editPrinterDialog.show({
			name: printer.name,
			ipAddress: printer.ipAddress
		})
	}

	editPrinterDialogPrimaryButtonClick(event: {
		name: string
		ipAddress: string
	}) {
		this.editPrinterDialogLoading = true

		// Validierung
		if (event.name.length === 0) {
			this.editPrinterDialogNameError = "Name darf nicht leer sein."
			this.editPrinterDialogLoading = false
			return
		}

		if (event.ipAddress.length === 0) {
			this.editPrinterDialogIpAddressError =
				"IP-Adresse darf nicht leer sein."
			this.editPrinterDialogLoading = false
			return
		}

		// Drucker aktualisieren
		if (this.editPrinterDialogPrinterUuid) {
			const idx = this.printers.findIndex(
				p => p.uuid === this.editPrinterDialogPrinterUuid
			)
			if (idx !== -1) {
				this.printers[idx].name = event.name
				this.printers[idx].ipAddress = event.ipAddress
			}
		}

		this.editPrinterDialogLoading = false
		this.editPrinterDialog.hide()
	}

	clearEditPrinterDialogErrors() {
		this.editPrinterDialogNameError = ""
		this.editPrinterDialogIpAddressError = ""
	}

	async testPrinter(printer: Printer) {
		this.printerTestLoading = printer.uuid

		const toast = document.createElement("dav-toast")
		toast.paddingBottom = this.dataService.isMobile ? 80 : 0

		try {
			await this.printerService.testPrinter(printer)
			toast.text = "Test-Bon erfolgreich gesendet!"
		} catch (err) {
			toast.text = "Fehler beim Drucken: " + err
		}

		this.printerTestLoading = null
		Toast.show(toast)
	}
}
