export class EpsonPrinter {
	private ipAddress: string = null
	private printer: epson.ePOSDevice = null
	public status: "online" | "offline" | "loading" = "loading"

	constructor(ipAddress: string) {
		this.ipAddress = ipAddress
		this.printer = new epson.ePOSDevice()

		this.printer.onreconnecting = () => {
			this.status = "loading"
		}

		this.printer.onreconnect = () => {
			this.status = "online"
		}

		this.printer.ondisconnect = () => {
			this.status = "offline"
		}
	}

	async connect() {
		if (this.printer.isConnected()) return

		const result = await new Promise<string>(resolve => {
			this.printer.connect(
				this.ipAddress,
				8008,
				(result: string) => resolve(result),
				{ eposprint: true }
			)
		})

		if (result === "OK" || result === "SSL_CONNECT_OK") {
			this.status = "online"
		} else {
			this.status = "offline"
			throw new Error(result)
		}
	}
}
