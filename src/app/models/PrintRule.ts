import { Printer } from "./Printer"
import { Category } from "./Category"
import { Product } from "./Product"
import { ProductType, PrintRuleType } from "../types"

export class PrintRule {
	uuid: string
	type: PrintRuleType
	productType?: ProductType
	printers: Printer[]
	categories: Category[]
	products: Product[]
}
