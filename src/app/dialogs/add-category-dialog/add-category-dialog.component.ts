import { isPlatformBrowser } from "@angular/common"
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
import { Dialog } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-add-category-dialog",
	standalone: false,
	templateUrl: "./add-category-dialog.component.html",
	styleUrl: "./add-category-dialog.component.scss"
})
export class AddCategoryDialogComponent {
	locale = this.localizationService.locale.dialogs.addCategoryDialog
	actionsLocale = this.localizationService.locale.actions

	@Input() loading: boolean = false
	@Input() nameError: string = ""
	@Output() primaryButtonClick = new EventEmitter<{ name: string }>()
	@Output() clearErrors = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>

	visible: boolean = false
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

	show() {
		this.visible = true
	}

	hide() {
		this.visible = false
		this.reset()
	}

	reset() {
		this.name = ""
		this.nameError = ""
	}

	submit() {
		if (!this.name.trim()) {
			this.nameError = this.locale.nameRequired
			return
		}

		this.primaryButtonClick.emit({
			name: this.name
		})
	}

	nameTextfieldChange(newValue: string) {
		this.name = newValue
		this.nameError = ""
		this.clearErrors.emit()
	}
}
