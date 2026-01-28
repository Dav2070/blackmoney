import { Component, ViewChild } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { Category } from "src/app/models/Category"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { AddCategoryDialogComponent } from "src/app/dialogs/add-category-dialog/add-category-dialog.component"
import {
	convertCategoryResourceToCategory,
	getGraphQLErrorCodes
} from "src/app/utils"
import * as ErrorCodes from "src/app/errorCodes"

@Component({
	templateUrl: "./categories-page.component.html",
	styleUrls: ["./categories-page.component.scss"],
	standalone: false
})
export class CategoriesPageComponent {
	@ViewChild("addCategoryDialog")
	addCategoryDialog!: AddCategoryDialogComponent
	addCategoryDialogLoading: boolean = false
	addCategoryDialogNameError: string = ""

	locale = this.localizationService.locale.categoriesPage
	actionsLocale = this.localizationService.locale.actions
	errorsLocale = this.localizationService.locale.errors

	categories: Category[] = []
	uuid: string = null
	loading: boolean = true

	constructor(
		private readonly apiService: ApiService,
		private readonly dataService: DataService,
		private readonly localizationService: LocalizationService,
		private readonly router: Router,
		private readonly activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		await this.dataService.blackmoneyUserPromiseHolder.AwaitResult()

		this.uuid = this.activatedRoute.snapshot.paramMap.get("uuid")

		// Load data
		await this.loadData()
	}

	async loadData() {
		this.categories = []
		this.loading = true

		const listCategoriesResponse = await this.apiService.listCategories(
			`
				items {
					uuid
					name
				}
			`,
			{ restaurantUuid: this.uuid }
		)

		if (listCategoriesResponse.data != null) {
			for (const category of listCategoriesResponse.data.listCategories
				.items) {
				this.categories.push(convertCategoryResourceToCategory(category))
			}
		}

		this.loading = false
	}

	navigateBack() {
		this.router.navigate(["user", "restaurants", this.uuid, "menu"])
	}

	navigateToProducts(event: Event, category: Category) {
		event.preventDefault()

		this.router.navigate([
			"user",
			"restaurants",
			this.uuid,
			"menu",
			"categories",
			category.uuid
		])
	}

	showAddCategoryDialog() {
		this.addCategoryDialog.show()
	}

	async addCategoryDialogPrimaryButtonClick(event: { name: string }) {
		this.addCategoryDialogLoading = true
		this.addCategoryDialogNameError = ""

		const createCategoryResponse = await this.apiService.createCategory(
			`
				uuid
				name
			`,
			{
				restaurantUuid: this.uuid,
				name: event.name
			}
		)

		this.addCategoryDialogLoading = false

		if (createCategoryResponse.data?.createCategory != null) {
			const newCategory = convertCategoryResourceToCategory(
				createCategoryResponse.data.createCategory
			)
			this.categories = [...this.categories, newCategory]

			this.addCategoryDialog.hide()
		} else {
			const errors = getGraphQLErrorCodes(createCategoryResponse)
			if (errors == null) return

			for (const errorCode of errors) {
				switch (errorCode) {
					case ErrorCodes.categoryNameAlreadyInUse:
						this.addCategoryDialogNameError =
							this.errorsLocale.categoryNameAlreadyExists
						break
					case ErrorCodes.nameTooShort:
						this.addCategoryDialogNameError =
							this.errorsLocale.nameTooShort
						break
					case ErrorCodes.nameTooLong:
						this.addCategoryDialogNameError =
							this.errorsLocale.nameTooLong
						break
					default:
						this.addCategoryDialogNameError =
							this.errorsLocale.unexpectedError
						break
				}
			}
		}
	}
}
