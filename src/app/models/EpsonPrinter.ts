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

	async printTestPage() {
		if (this.status !== "online") {
			throw new Error("Printer is not online")
		}

		this.printer.onreceive = result => {
			console.log("onreceive", result)
		}

		await addImage(this.printer, "/assets/icons/logo-full-dark.png", 63)
		this.printer.addTextAlign("center")
		this.printer.addText(`\nDanke für dein Vertrauen!\n`) // Achtung: Am Ende muss immer ein \n sein, sonst wird kein Cut gemacht
		this.printer.addFeedLine(3)
		this.printer.addCut("feed")
		this.printer.send()
	}
}

async function addImage(printer: epson.Printer, imagePath: string, x: number) {
	const canvas = document.createElement("canvas")
	canvas.width = 576 // Width of the printer paper in dots

	// Load the image
	const ctx = canvas.getContext("2d")
	const img = new Image()
	img.src = imagePath
	await new Promise(resolve => (img.onload = resolve))

	const width = img.width
	const height = img.height

	ctx.drawImage(img, x, 0, width, height)
	printer.addImage(ctx, 0, 0, width + x, height, "color_1", "mono")
}
