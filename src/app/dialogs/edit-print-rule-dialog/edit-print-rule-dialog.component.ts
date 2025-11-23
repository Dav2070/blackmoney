import {
	Component,
	ElementRef,
	EventEmitter,
	Inject,
	Input,
	Output,
	PLATFORM_ID,
	ViewChild
} from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { Dialog } from "dav-ui-components"
import { SearchResult } from "../add-print-rule-dialog/add-print-rule-dialog.component"
import { LocalizationService } from "src/app/services/localization-service"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { CategoryType, PrinterResource, PrintRuleType } from "src/app/types"

@Component({
	selector: "app-edit-print-rule-dialog",
	templateUrl: "./edit-print-rule-dialog.component.html",
	styleUrl: "./edit-print-rule-dialog.component.scss",
	standalone: false
})
export class EditPrintRuleDialogComponent {
	locale = this.localizationService.locale.dialogs.editPrintRuleDialog
	actionsLocale = this.localizationService.locale.actions

	@Input() loading: boolean = false
	@Input() restaurantUuid: string = ""
	@Input() printRuleType: PrintRuleType = "BILLS"
	@Input() categoryType: CategoryType = null
	@Input() selectedPrinters: SearchResult[] = []
	@Input() selectedCategories: SearchResult[] = []
	@Input() selectedProducts: SearchResult[] = []
	@Output() primaryButtonClick = new EventEmitter()

	@ViewChild("dialog") dialog!: ElementRef<Dialog>
	visible: boolean = false
	printers: SearchResult[] = []
	categories: SearchResult[] = []
	products: SearchResult[] = []

	constructor(
		private dataService: DataService,
		private apiService: ApiService,
		private localizationService: LocalizationService,
		@Inject(PLATFORM_ID) private platformId: object
	) {}

	async ngAfterViewInit() {
		if (isPlatformBrowser(this.platformId)) {
			document.body.appendChild(this.dialog.nativeElement)
		}

		await this.dataService.blackmoneyUserPromiseHolder.AwaitResult()
		await this.dataService.restaurantPromiseHolder.AwaitResult()

		await this.updatePrintersSearchResults()
		await this.updateCategoriesSearchResults()
		await this.updateProductsSearchResults()
	}

	ngOnDestroy() {
		if (isPlatformBrowser(this.platformId)) {
			document.body.removeChild(this.dialog.nativeElement)
		}
	}

	printersSearchtextfieldChange(event: Event) {
		const value = (event as CustomEvent).detail.value
		this.updatePrintersSearchResults(value)
	}

	printersSearchTextfieldSelect(event: Event) {
		const result = (event as CustomEvent).detail.result
		this.selectedPrinters.push(result)
		this.updatePrintersSearchResults()
	}

	removeSelectedPrinter(uuid: string) {
		const i = this.selectedPrinters.findIndex(p => p.key === uuid)
		if (i !== -1) this.selectedPrinters.splice(i, 1)

		this.updatePrintersSearchResults()
	}

	categoriesSearchTextfieldChange(event: Event) {
		const value = (event as CustomEvent).detail.value
		this.updateCategoriesSearchResults(value)
	}

	categoriesSearchTextfieldSelect(event: Event) {
		const result = (event as CustomEvent).detail.result
		this.selectedCategories.push(result)
		this.updateCategoriesSearchResults()
	}

	removeSelectedCategory(uuid: string) {
		const i = this.selectedCategories.findIndex(c => c.key === uuid)
		if (i !== -1) this.selectedCategories.splice(i, 1)

		this.updateCategoriesSearchResults()
	}

	productsSearchTextfieldChange(event: Event) {
		const value = (event as CustomEvent).detail.value
		this.updateProductsSearchResults(value)
	}

	productsSearchTextfieldSelect(event: Event) {
		const result = (event as CustomEvent).detail.result
		this.selectedProducts.push(result)
		this.updateProductsSearchResults()
	}

	removeSelectedProduct(uuid: string) {
		const i = this.selectedProducts.findIndex(p => p.key === uuid)
		if (i !== -1) this.selectedProducts.splice(i, 1)

		this.updateProductsSearchResults()
	}

	async updatePrintersSearchResults(query: string = "") {
		const searchPrintersResponse = await this.apiService.searchPrinters(
			`
				items {
					uuid
					name
				}
			`,
			{
				restaurantUuid: this.restaurantUuid,
				query,
				exclude: this.selectedPrinters.map(p => p.key)
			}
		)

		if (searchPrintersResponse.data.searchPrinters != null) {
			this.printers = searchPrintersResponse.data.searchPrinters.items.map(
				(printer: PrinterResource) => ({
					key: printer.uuid,
					value: printer.name
				})
			)
		}
	}

	async updateCategoriesSearchResults(query: string = "") {
		const searchCategoriesResponse = await this.apiService.searchCategories(
			`
				items {
					uuid
					name
				}
			`,
			{
				restaurantUuid: this.restaurantUuid,
				query,
				exclude: this.selectedCategories.map(c => c.key)
			}
		)

		if (searchCategoriesResponse.data.searchCategories != null) {
			this.categories =
				searchCategoriesResponse.data.searchCategories.items.map(
					(category: any) => ({
						key: category.uuid,
						value: category.name
					})
				)
		}
	}

	async updateProductsSearchResults(query: string = "") {
		const searchProductsResponse = await this.apiService.searchProducts(
			`
				items {
					uuid
					name
				}
			`,
			{
				restaurantUuid: this.restaurantUuid,
				query,
				exclude: this.selectedProducts.map(p => p.key)
			}
		)

		if (searchProductsResponse.data.searchProducts != null) {
			this.products = searchProductsResponse.data.searchProducts.items.map(
				(product: any) => ({
					key: product.uuid,
					value: product.name
				})
			)
		}
	}

	getPrintersSubheadText() {
		switch (this.printRuleType) {
			case "CATEGORIES":
			case "PRODUCTS":
				return this.locale.printersSubhead
			case "CATEGORY_TYPE":
				if (this.categoryType === "DRINK") {
					return this.locale.printersTypeSubhead.replace(
						"{type}",
						this.locale.drinks
					)
				} else if (this.categoryType === "FOOD") {
					return this.locale.printersTypeSubhead.replace(
						"{type}",
						this.locale.food
					)
				} else {
					return this.locale.printersTypeSubhead.replace(
						"{type}",
						this.locale.foodAndDrinks
					)
				}
			default:
				return this.locale.printersTypeSubhead.replace(
					"{type}",
					this.locale.bills
				)
		}
	}

	show() {
		this.visible = true

		this.updatePrintersSearchResults()
		this.updateCategoriesSearchResults()
		this.updateProductsSearchResults()
	}

	hide() {
		this.visible = false
	}

	submit() {
		this.primaryButtonClick.emit({
			printerUuids: this.selectedPrinters.map(p => p.key),
			categoryUuids: this.selectedCategories.map(c => c.key),
			productUuids: this.selectedProducts.map(p => p.key)
		})
	}
}
