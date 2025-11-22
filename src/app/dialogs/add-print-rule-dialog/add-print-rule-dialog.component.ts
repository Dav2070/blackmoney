import {
	Component,
	ElementRef,
	Input,
	Output,
	ViewChild,
	EventEmitter,
	Inject,
	PLATFORM_ID
} from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { Dialog } from "dav-ui-components"
import { DataService } from "src/app/services/data-service"
import { ApiService } from "src/app/services/api-service"
import { LocalizationService } from "src/app/services/localization-service"
import { PrinterResource } from "src/app/types"

export type SelectedPrintRuleType =
	| "bills"
	| "allFoodAndDrinks"
	| "allDrinks"
	| "allFood"
	| "categories"
	| "products"

interface SearchResult {
	key: string
	value: string
}

@Component({
	selector: "app-add-print-rule-dialog",
	templateUrl: "./add-print-rule-dialog.component.html",
	styleUrl: "./add-print-rule-dialog.component.scss",
	standalone: false
})
export class AddPrintRuleDialogComponent {
	locale = this.localizationService.locale.dialogs.addPrintRuleDialog
	actionsLocale = this.localizationService.locale.actions

	@Input() loading: boolean = false
	@Input() restaurantUuid: string = ""
	@Output() primaryButtonClick = new EventEmitter<{
		printerUuids: string[]
		printRuleType: SelectedPrintRuleType
		categoryUuids: string[]
		productUuids: string[]
	}>()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false
	selectedPrintRuleType: SelectedPrintRuleType = "bills"

	printers: SearchResult[] = []
	selectedPrinters: SearchResult[] = []
	categories: SearchResult[] = []
	selectedCategories: SearchResult[] = []
	products: SearchResult[] = []
	selectedProducts: SearchResult[] = []

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

	async printersSearchtextfieldChange(event: Event) {
		const value = (event as CustomEvent).detail.value
		await this.updatePrintersSearchResults(value)
	}

	printersSearchTextfieldSelect(event: Event) {
		const result = (event as CustomEvent).detail.result
		this.selectedPrinters.push(result)
		this.updatePrintersSearchResults()
	}

	removeSelectedPrinter(uuid: string) {
		const i = this.selectedPrinters.findIndex(p => p.key === uuid)
		if (i !== -1) this.selectedPrinters.splice(i, 1)
	}

	async categoriesSearchTextfieldChange(event: Event) {
		const value = (event as CustomEvent).detail.value
		await this.updateCategoriesSearchResults(value)
	}

	categoriesSearchTextfieldSelect(event: Event) {
		const result = (event as CustomEvent).detail.result
		this.selectedCategories.push(result)
		this.updateCategoriesSearchResults()
	}

	removeSelectedCategory(uuid: string) {
		const i = this.selectedCategories.findIndex(c => c.key === uuid)
		if (i !== -1) this.selectedCategories.splice(i, 1)
	}

	async productsSearchTextfieldChange(event: Event) {
		const value = (event as CustomEvent).detail.value
		await this.updateProductsSearchResults(value)
	}

	productsSearchTextfieldSelect(event: Event) {
		const result = (event as CustomEvent).detail.result
		this.selectedProducts.push(result)
		this.updateProductsSearchResults()
	}

	removeSelectedProduct(uuid: string) {
		const i = this.selectedProducts.findIndex(p => p.key === uuid)
		if (i !== -1) this.selectedProducts.splice(i, 1)
	}

	radioGroupChange(event: Event) {
		this.selectedPrintRuleType = (event as CustomEvent).detail
			.checked as SelectedPrintRuleType
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

	show() {
		this.selectedPrinters = []
		this.selectedCategories = []
		this.selectedProducts = []
		this.selectedPrintRuleType = "bills"
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
			printRuleType: this.selectedPrintRuleType,
			categoryUuids: this.selectedCategories.map(c => c.key),
			productUuids: this.selectedProducts.map(p => p.key)
		})
	}
}
