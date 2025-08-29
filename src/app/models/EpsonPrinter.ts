export class EpsonPrinter {
	public ipAddress: string = null
	public status: "online" | "offline" | "loading" = "loading"
	private device: epson.ePOSDevice = null
	private printer: epson.Printer = null

	constructor(ipAddress: string) {
		this.ipAddress = ipAddress
		this.device = new epson.ePOSDevice()

		this.device.onreconnecting = () => {
			this.status = "loading"
		}

		this.device.onreconnect = () => {
			this.status = "online"
		}

		this.device.ondisconnect = () => {
			this.status = "offline"
		}
	}

	async connect() {
		if (this.status === "online") return

		const connectResult = await new Promise<string>(resolve => {
			this.device.connect(
				this.ipAddress,
				8008,
				(result: string) => resolve(result),
				{ eposprint: true }
			)
		})

		if (connectResult !== "OK" && connectResult !== "SSL_CONNECT_OK") {
			this.status = "offline"
			throw new Error(connectResult)
		}

		this.status = "online"

		// Create the printer object
		const createDeviceResult = await new Promise<{
			printer: epson.Printer | null
			result: epson.CreateDeviceResult
		}>(resolve => {
			this.device.createDevice<epson.Printer>(
				"local_printer",
				"type_printer",
				{ crypto: false, buffer: false },
				(printer: epson.Printer, result: epson.CreateDeviceResult) =>
					resolve({
						printer,
						result
					})
			)
		})

		if (createDeviceResult.printer) {
			this.printer = createDeviceResult.printer
		}

		if (createDeviceResult.result !== "OK") {
			this.status = "offline"
			throw new Error(createDeviceResult.result)
		}

		this.status = "online"
	}

	printTestPage(name: string) {
		if (this.status !== "online") {
			throw new Error("Printer is not online")
		}

		this.printer.onreceive = result => {
			console.log("onreceive", result)
		}

		this.printer.addTextAlign("center")
		this.printer.addText(`${name}\n`) // Achtung: Am Ende muss immer ein \n sein, sonst wird kein Cut gemacht
		this.printer.addCut()
		this.printer.send()
	}
}
