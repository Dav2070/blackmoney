import { Register } from "./Register"
import { PrintRule } from "./PrintRule"

export class RegisterClient {
	uuid: string
	name?: string
	serialNumber: string
	register: Register
	printRules: PrintRule[]
}
