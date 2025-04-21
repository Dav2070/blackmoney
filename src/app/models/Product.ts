import { Variation } from './Variation'

export class Product {
	id: number
	uuid: string
	name: string
	price: number
	variations: Variation[]
}
