import { Printer } from "./Printer"
import { Category } from "./Category"
import { Product } from "./Product"
import { CategoryType, PrintRuleType } from "../types"

export class PrintRule {
	uuid: string
	type: PrintRuleType
	categoryType?: CategoryType
	printers: Printer[]
	categories: Category[]
	products: Product[]
}
