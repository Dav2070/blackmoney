import { RegisterStatus } from "../types"
import { RegisterClient } from "./RegisterClient"

export class Register {
	uuid: string
	name: string
	status: RegisterStatus
	registerClients: RegisterClient[]
}
