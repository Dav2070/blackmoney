import { Component, OnInit } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { Product } from "src/app/models/Product"
import { DataService } from "src/app/services/data-service"
import { faPen, faTrash } from "@fortawesome/pro-regular-svg-icons"

@Component({
	selector: "app-product-list",
	standalone: false,
	templateUrl: "./product-list.component.html",
	styleUrl: "./product-list.component.scss"
})
export class ProductListComponent implements OnInit {
	products: Product[] = []
	uuid: string | null = null
	faPen = faPen
	faTrash = faTrash

	constructor(
		private readonly dataService: DataService,
		private readonly router: Router,
		private readonly activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		this.uuid =
			this.activatedRoute.parent?.snapshot.paramMap.get("uuid") ?? null
		console.log("ProductList ngOnInit - uuid:", this.uuid)

		// Mock-Daten zum Testen
		this.products = [
			{
				uuid: "1",
				name: "Pizza Margherita",
				price: 850,
				type: "FOOD",
				category: null,
				variations: [],
				takeaway: true
			},
			{
				uuid: "2",
				name: "Pasta Carbonara",
				price: 950,
				type: "FOOD",
				category: null,
				variations: [],
				takeaway: false
			}
		] as Product[]

		console.log("ProductList loaded products:", this.products)
	}

	// Normale Methoden (keine EventEmitter mehr!)
	editProduct(product: Product) {
		console.log("Edit product clicked:", product)
		if (!this.uuid) {
			console.error("No restaurant UUID available for navigation")
			return
		}
		this.router.navigate([
			"user",
			"restaurants",
			this.uuid,
			"menu",
			"product",
			"edit",
			product.uuid
		])
	}

	deleteProduct(product: Product) {
		console.log("Delete product clicked:", product)
		const confirmed = confirm(`Produkt "${product.name}" wirklich löschen?`)
		if (!confirmed) return

		this.products = this.products.filter(p => p.uuid !== product.uuid)
		console.log("Product deleted, remaining:", this.products)
	}
}
