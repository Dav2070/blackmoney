import { PrintRule } from "./PrintRule"

export class RegisterClient {
	uuid: string
	name?: string
	serialNumber: string
	printRules: PrintRule[]
}
