import { Component, ViewChild } from "@angular/core"
import { faPen, faPrint } from "@fortawesome/pro-regular-svg-icons"
import { Toast } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"
import { PrinterService } from "src/app/services/printer-service"
import { DataService } from "src/app/services/data-service"
import { Printer } from "src/app/models/Printer"
import { AddPrinterDialogComponent } from "src/app/dialogs/add-printer-dialog/add-printer-dialog.component"
import { EditPrinterDialogComponent } from "src/app/dialogs/edit-printer-dialog/edit-printer-dialog.component"

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

	printers: Printer[] = [
		{
			uuid: "1",
			name: "Küche",
			ipAdress: "192.168.188.121"
		},
		{
			uuid: "2",
			name: "Theke",
			ipAdress: "192.168.1.11"
		},
		{
			uuid: "3",
			name: "Büro",
			ipAdress: "192.168.1.12"
		}
	]

	printerStatus: { [uuid: string]: "online" | "offline" | "loading" } = {}
	printerTestLoading: string = null

	// Add-Dialog Properties
	addPrinterDialogLoading = false
	addPrinterDialogNameError = ""
	addPrinterDialogIpAdressError = ""

	// Edit-Dialog Properties
	editPrinterDialogLoading = false
	editPrinterDialogNameError = ""
	editPrinterDialogIpAdressError = ""
	editPrinterDialogName = ""
	editPrinterDialogIpAdress = ""
	editPrinterDialogPrinterUuid: string | null = null

	@ViewChild("addPrinterDialog") addPrinterDialog!: AddPrinterDialogComponent
	@ViewChild("editPrinterDialog")
	editPrinterDialog!: EditPrinterDialogComponent

	constructor(
		private localizationService: LocalizationService,
		private printerService: PrinterService,
		private dataService: DataService
	) {}

	ngOnInit() {
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
		ipAdress: string
	}) {
		this.addPrinterDialogLoading = true
		// Validierung
		if (event.name.length === 0) {
			this.addPrinterDialogNameError = "Name darf nicht leer sein."
			this.addPrinterDialogLoading = false
			return
		}
		if (event.ipAdress.length === 0) {
			this.addPrinterDialogIpAdressError = "IP-Adresse darf nicht leer sein."
			this.addPrinterDialogLoading = false
			return
		}
		// Drucker hinzufügen
		this.printers.push({
			uuid: (Math.random() * 1000000).toFixed(0),
			name: event.name,
			ipAdress: event.ipAdress
		})
		this.addPrinterDialogLoading = false
		this.addPrinterDialog.hide()
	}

	clearAddPrinterDialogErrors() {
		this.addPrinterDialogNameError = ""
		this.addPrinterDialogIpAdressError = ""
	}

	// --- Edit Dialog ---
	showEditPrinterDialog(printer: Printer) {
		this.clearEditPrinterDialogErrors()
		this.editPrinterDialogPrinterUuid = printer.uuid ?? null
		this.editPrinterDialogName = printer.name
		this.editPrinterDialogIpAdress = printer.ipAdress
		this.editPrinterDialog.show({
			name: printer.name,
			ipAdress: printer.ipAdress
		})
	}

	editPrinterDialogPrimaryButtonClick(event: {
		name: string
		ipAdress: string
	}) {
		this.editPrinterDialogLoading = true
		// Validierung
		if (event.name.length === 0) {
			this.editPrinterDialogNameError = "Name darf nicht leer sein."
			this.editPrinterDialogLoading = false
			return
		}
		if (event.ipAdress.length === 0) {
			this.editPrinterDialogIpAdressError =
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
				this.printers[idx].ipAdress = event.ipAdress
			}
		}
		this.editPrinterDialogLoading = false
		this.editPrinterDialog.hide()
	}

	clearEditPrinterDialogErrors() {
		this.editPrinterDialogNameError = ""
		this.editPrinterDialogIpAdressError = ""
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
