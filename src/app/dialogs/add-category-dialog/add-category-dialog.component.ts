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

	visible: boolean = false
	name: string = ""

	@Input() nameError: string = ""
	@Input() loading: boolean = false
	@Output() primaryButtonClick = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>

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
	}

	nameTextfieldChange(event: Event) {
		this.name = (event as CustomEvent).detail.value
	}

	submit() {
		this.primaryButtonClick.emit({
			name: this.name
		})
	}
}
