import { Injectable } from "@angular/core"
import { Printer } from "../models/Printer"

declare var epson: any

@Injectable({ providedIn: "root" })
export class PrinterService {
	private ePosDev: any = null
	private printerObj: any = null

	async connect(printer: Printer): Promise<void> {
		return new Promise((resolve, reject) => {
			this.ePosDev = new epson.ePOSDevice()

			this.ePosDev.connect(
				printer.ipAddress,
				8008,
				(result: string) => {
					if (result === "OK" || result === "SSL_CONNECT_OK") {
						this.ePosDev.createDevice(
							"local_printer",
							this.ePosDev.DEVICE_TYPE_PRINTER,
							{ crypto: false, buffer: false },
							(deviceObj: any, retcode: string) => {
								if (retcode === "OK") {
									this.printerObj = deviceObj
									this.printerObj.timeout = 60000

									// Monitoring-Events registrieren
									this.printerObj.onstatuschange = (status: any) => {
										console.log("Status geändert:", status)
										// Hier kannst du z.B. im UI anzeigen
									}
									this.printerObj.oncoveropen = () => {
										console.log("Druckerabdeckung offen!")
									}
									this.printerObj.oncoverclose = () => {
										console.log("Druckerabdeckung geschlossen!")
									}

									resolve()
								} else {
									reject(
										"Gerät konnte nicht erstellt werden: " + retcode
									)
								}
							}
						)
					} else {
						reject("Verbindung fehlgeschlagen: " + result)
					}
				},
				{ eposprint: true }
			)
		})
	}

	async testPrinter(printer: Printer): Promise<void> {
		await this.connect(printer)
		return new Promise((resolve, reject) => {
			this.printerObj.onreceive = (res: any) => {
				console.log("onreceive:", res)

				if (res.success) {
					resolve()
				} else {
					reject(
						"Druck fehlgeschlagen: " + (res.code || "Unbekannter Fehler")
					)
				}
				this.disconnect()
			}
			// Druckdaten zentriert
			this.printerObj.addTextAlign(this.printerObj.ALIGN_CENTER)
			this.printerObj.addText(printer.name + "\nTest\n\n\n\n\n\n\n\n\n\n\n")
			this.printerObj.addCut()
			this.printerObj.send()
		})
	}

	async printText(printer: Printer, text: string): Promise<void> {
		await this.connect(printer)
		return new Promise((resolve, reject) => {
			this.printerObj.onreceive = (res: any) => {
				console.log("onreceive:", res)

				if (res.success) {
					resolve()
				} else {
					reject(
						"Druck fehlgeschlagen: " + (res.code || "Unbekannter Fehler")
					)
				}
				this.disconnect()
			}
			this.printerObj.addText(text)
			this.printerObj.send()
		})
	}

	async disconnect(): Promise<void> {
		if (this.ePosDev && this.printerObj) {
			this.ePosDev.deleteDevice(this.printerObj, (_errorCode: any) => {
				this.ePosDev.disconnect()
				this.ePosDev = null
				this.printerObj = null
			})
		}
	}

	startMonitor() {
		if (this.printerObj) {
			this.printerObj.startMonitor()
		}
	}

	stopMonitor() {
		if (this.printerObj) {
			this.printerObj.stopMonitor()
		}
	}

	async getStatus(printer: Printer): Promise<"online" | "offline"> {
		try {
			await this.connect(printer)
			await this.disconnect()
			return "online"
		} catch {
			return "offline"
		}
	}
}
