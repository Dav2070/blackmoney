import {
	Component,
	OnInit,
	ViewChild,
	ElementRef,
	HostListener
} from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { faPen, faTrash, faEllipsis } from "@fortawesome/free-solid-svg-icons"
import { Category } from "src/app/models/Category"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { AddCategoryDialogComponent } from "src/app/dialogs/add-category-dialog/add-category-dialog.component"
import { EditCategoryDialogComponent } from "src/app/dialogs/edit-category-dialog/edit-category-dialog.component"
import { ContextMenu } from "dav-ui-components"

@Component({
	selector: "app-category-page",
	templateUrl: "./category-page.component.html",
	styleUrls: ["./category-page.component.scss"],
	standalone: false
})
export class CategoryPageComponent implements OnInit {
	@ViewChild("addCategoryDialog")
	addCategoryDialog!: AddCategoryDialogComponent
	addCategoryDialogLoading: boolean = false
	addCategoryDialogNameError: string = ""

	@ViewChild("editCategoryDialog")
	editCategoryDialog!: EditCategoryDialogComponent
	editCategoryDialogLoading: boolean = false
	editCategoryDialogNameError: string = ""

	// Context Menu
	categoryContextMenuVisible: boolean = false
	categoryContextMenuX: number = 0
	categoryContextMenuY: number = 0
	selectedCategoryForContext: Category = null
	@ViewChild("categoryContextMenu")
	categoryContextMenu: ElementRef<ContextMenu>

	locale = this.localizationService.locale.categoryPage
	actionsLocale = this.localizationService.locale.actions
	faPen = faPen
	faTrash = faTrash
	faEllipsis = faEllipsis

	categories: Category[] = []
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

		// Load categories from service/API
		this.loadCategories()
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

	loadCategories() {
		// TODO: Load from service
		this.categories = [
			{ uuid: "1", name: "Pizza", products: [] },
			{ uuid: "2", name: "Pasta", products: [] },
			{ uuid: "3", name: "Getränke", products: [] }
		]
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
			"category",
			category.uuid
		])
	}

	showAddCategoryDialog() {
		this.addCategoryDialog.show()
	}

	async addCategoryDialogPrimaryButtonClick(event: { name: string }) {
		const newCategory: Category = {
			uuid: crypto.randomUUID(),
			name: event.name,
			products: []
		}
		this.categories.push(newCategory)
		this.addCategoryDialog.hide()
		// TODO: Save to API
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

	editSelectedCategory() {
		if (!this.selectedCategoryForContext) return
		this.editCategoryDialog.show(this.selectedCategoryForContext)
		this.categoryContextMenuVisible = false
	}

	editCategoryDialogPrimaryButtonClick(event: { uuid: string; name: string }) {
		const idx = this.categories.findIndex(c => c.uuid === event.uuid)
		if (idx !== -1) {
			this.categories[idx].name = event.name
		}
		this.editCategoryDialog.hide()
		// TODO: Save to API
	}

	deleteSelectedCategory() {
		if (!this.selectedCategoryForContext) return
		this.deleteCategory(this.selectedCategoryForContext)
		this.categoryContextMenuVisible = false
	}

	deleteCategory(category: Category) {
		this.categories = this.categories.filter(c => c.uuid !== category.uuid)
		// TODO: Delete via API
	}
}
