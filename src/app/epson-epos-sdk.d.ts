declare namespace epson {
	type ConnectionResult =
		| "OK"
		| "SSL_CONNECT_OK"
		| "ERROR_TIMEOUT"
		| "ERROR_PARAMETER"

	interface ConnectOptions {
		eposprint?: boolean
	}

	interface DeviceCallback<T> {
		(device: T | null, error: string): void
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
			type: string,
			options: object,
			callback: DeviceCallback<T>
		): void

		deleteDevice(device: object): void

		// Events
		onreconnecting?: () => void
		onreconnect?: () => void
		ondisconnect?: () => void
	}

	interface Printer {
		addText(text: string): void
		addFeedLine(lines: number): void
		addCut(type?: number): void
		send(
			callback: (result: string, code: number, status: object) => void
		): void
	}

	interface Display {
		addText(text: string): void
		send(callback: (result: string) => void): void
	}

	// Weitere Geräte wie Scanner, MSR, etc. kannst du bei Bedarf ergänzen
}
