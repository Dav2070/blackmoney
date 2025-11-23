import { Component, ViewChild } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { faPen } from "@fortawesome/pro-regular-svg-icons"
import { AddCategoryDialogComponent } from "src/app/dialogs/add-category-dialog/add-category-dialog.component"
import { Category } from "src/app/models/Category"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-category-page",
	templateUrl: "./category-page.component.html",
	styleUrl: "./category-page.component.scss",
	standalone: false
})
export class CategoryPageComponent {
	@ViewChild("addCategoryDialog")
	addCategoryDialog!: AddCategoryDialogComponent
	addRoomDialogLoading: boolean = false
	addRoomDialogNameError: string = ""

	locale = this.localizationService.locale.categoryPage
	errorsLocale = this.localizationService.locale.errors
	categories: Category[] = [
		{ uuid: "1", name: "Vorspeise",  products: [] },
		{ uuid: "2", name: "Hauptspeise",  products: [] },
		{
			uuid: "3",
			name: "Bier",

			products: []
		},
		{
			uuid: "4",
			name: "Softdrinks",
			products: []
		}
	]
	category: Category = null
	uuid: string = null

	constructor(
		private apiService: ApiService,
		private dataService: DataService,
		private localizationService: LocalizationService,
		private router: Router,
		private readonly activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		await this.dataService.blackmoneyUserPromiseHolder.AwaitResult()

		this.uuid = this.activatedRoute.snapshot.paramMap.get("uuid")
	}

	navigateBack() {
		this.router.navigate([
			"user",
			"restaurants",
			this.uuid,
			"menu",
			"product"
		])
	}

	navigateToProducts(event: MouseEvent, category: Category) {
		event.preventDefault()

		this.router.navigate([
			"user",
			"restaurants",
			this.uuid,
			"menu",
			"product",
			"category",
			category.uuid
		])
	}

	async addCategoryDialogPrimaryButtonClick(event: { name: string }) {
		this.categories.push({
			uuid: "",
			name: event.name,
			products: []
		})

		this.addCategoryDialog.hide()
	}

	showAddCategoryDialog() {
		this.addCategoryDialog.show()
	}
}
