declare namespace epson {
	type ConnectionResult =
		| "OK"
		| "SSL_CONNECT_OK"
		| "ERROR_TIMEOUT"
		| "ERROR_PARAMETER"
	type DeviceType = "type_printer"
	type CreateDeviceResult =
		| "OK"
		| "DEVICE_NOT_FOUND"
		| "DEVICE_IN_USE"
		| "DEVICE_OPEN_ERROR"
		| "DEVICE_TYPE_INVALID"
		| "PARAM_ERROR"
		| "SYSTEM_ERROR"
	type TextAlign = "left" | "center" | "right"

	interface ConnectOptions {
		eposprint?: boolean
	}

	interface DeviceCallback<T> {
		(device: T | null, result: CreateDeviceResult): void
	}

	interface ConnectCallback {
		(result: ConnectionResult): void
	}

	class ePOSDevice {
		constructor()

		connect(
			ipAddress: string,
			port: number,
			callback: ConnectCallback,
			options?: ConnectOptions
		): void

		disconnect(): void

		isConnected(): boolean

		createDevice<T>(
			deviceId: string,
			deviceType: DeviceType,
			options: {
				crypto: boolean
				buffer: boolean
			},
			callback: DeviceCallback<T>
		): void

		deleteDevice(device: object): void

		// Events
		onreconnecting?: () => void
		onreconnect?: () => void
		ondisconnect?: () => void
	}

	interface Printer {
		addTextAlign(align: TextAlign): Printer
		addText(text: string): Printer
		addCut(type: "feed"): Printer
		addImage(
			context: CanvasRenderingContext2D,
			x: number,
			y: number,
			width: number,
			height: number,
			color: "none" | "color_1" | "color_2" | "color_3" | "color_4",
			mode: "mono" | "gray16"
		): Printer
		addFeedLine(line: number): Printer
		send(): void
		onreceive(callback: (result: any) => void): void
	}

	interface Display {
		addText(text: string): void
		send(callback: (result: string) => void): void
	}

	// Weitere Geräte wie Scanner, MSR, etc. kannst du bei Bedarf ergänzen
}
