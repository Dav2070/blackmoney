export interface TSEClient {
	id: number
	name: string
	seriennummer: string
}

export interface TSE {
	id: number
	name: string
	status: "aktiv" | "inaktiv" | "wartung"
	pin: string
	clients: TSEClient[]
}
