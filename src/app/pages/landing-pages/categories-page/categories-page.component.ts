import { Component, ViewChild, ElementRef, HostListener } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { faTrash, faEllipsis } from "@fortawesome/free-solid-svg-icons"
import { ContextMenu } from "dav-ui-components"
import { Category } from "src/app/models/Category"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { AddCategoryDialogComponent } from "src/app/dialogs/add-category-dialog/add-category-dialog.component"
import { convertCategoryResourceToCategory } from "src/app/utils"

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

	// Context Menu
	categoryContextMenuVisible: boolean = false
	categoryContextMenuX: number = 0
	categoryContextMenuY: number = 0
	selectedCategoryForContext: Category = null
	@ViewChild("categoryContextMenu")
	categoryContextMenu: ElementRef<ContextMenu>

	locale = this.localizationService.locale.categoryPage
	actionsLocale = this.localizationService.locale.actions
	faTrash = faTrash
	faEllipsis = faEllipsis

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
		event.stopPropagation()
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

		// TODO: API - Create category
		// Example: const created = await this.apiService.createCategory({
		//   restaurantUuid: this.uuid,
		//   name: event.name
		// })

		const newCategory: Category = {
			uuid: crypto.randomUUID(),
			name: event.name,
			products: []
		}
		this.categories = [...this.categories, newCategory]

		this.addCategoryDialogLoading = false
		this.addCategoryDialog.hide()
	}

	showCategoryContextMenu(event: Event, category: Category) {
		const detail = (event as CustomEvent).detail
		this.selectedCategoryForContext = category

		if (this.categoryContextMenuVisible) {
			this.categoryContextMenuVisible = false
		} else {
			this.categoryContextMenuX = detail.contextMenuPosition.x
			this.categoryContextMenuY = detail.contextMenuPosition.y
			this.categoryContextMenuVisible = true
		}
	}

	deleteSelectedCategory() {
		if (!this.selectedCategoryForContext) return
		this.deleteCategory(this.selectedCategoryForContext)
		this.categoryContextMenuVisible = false
	}

	deleteCategory(category: Category) {
		const confirmed = confirm(
			`Kategorie "${category.name}" wirklich löschen?`
		)
		if (!confirmed) return

		// TODO: API - Delete category
		// Example: await this.apiService.deleteCategory({ uuid: category.uuid })

		this.categories = this.categories.filter(c => c.uuid !== category.uuid)
	}

	@HostListener("document:click", ["$event"])
	documentClick(event: MouseEvent) {
		if (
			this.categoryContextMenuVisible &&
			!this.categoryContextMenu.nativeElement.contains(event.target as Node)
		) {
			this.categoryContextMenuVisible = false
		}
	}
}
