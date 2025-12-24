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
import { LocalizationService } from "src/app/services/localization-service"
import { Category } from "src/app/models/Category"

@Component({
	selector: "app-edit-category-dialog",
	templateUrl: "./edit-category-dialog.component.html",
	styleUrls: ["./edit-category-dialog.component.scss"],
	standalone: false
})
export class EditCategoryDialogComponent {
	locale = this.localizationService.locale.dialogs.editCategoryDialog
	actionsLocale = this.localizationService.locale.actions

	@Input() loading: boolean = false
	@Input() nameError: string = ""
	@Output() primaryButtonClick = new EventEmitter<{
		uuid: string
		name: string
	}>()
	@Output() clearErrors = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>

	visible: boolean = false
	category: Category = null
	name: string = ""

	constructor(
		private localizationService: LocalizationService,
		@Inject(PLATFORM_ID) private platformId: object
	) {}

	ngAfterViewInit() {
		if (isPlatformBrowser(this.platformId)) {
			document.body.appendChild(this.dialog.nativeElement)
		}
	}

	ngOnDestroy() {
		if (isPlatformBrowser(this.platformId)) {
			document.body.removeChild(this.dialog.nativeElement)
		}
	}

	show(category: Category) {
		this.category = category
		this.name = category.name
		this.visible = true
	}

	hide() {
		this.visible = false
		this.reset()
	}

	reset() {
		this.category = null
		this.name = ""
		this.nameError = ""
	}

	submit() {
		if (!this.name.trim()) {
			this.nameError = this.locale.nameRequired
			return
		}

		this.primaryButtonClick.emit({
			uuid: this.category.uuid,
			name: this.name
		})
	}

	nameTextfieldChange(newValue: string) {
		this.name = newValue
		this.nameError = ""
		this.clearErrors.emit()
	}
}
