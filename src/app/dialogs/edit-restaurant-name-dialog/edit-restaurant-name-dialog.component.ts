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

@Component({
	selector: "app-edit-restaurant-name-dialog",
	templateUrl: "./edit-restaurant-name-dialog.component.html",
	standalone: false
})
export class EditRestaurantNameDialogComponent {
	locale = this.localizationService.locale.dialogs.editRestaurantNameDialog
	actionsLocale = this.localizationService.locale.actions
	@Input() loading: boolean = false
	@Input() name: string = ""
	@Input() nameError: string = ""
	@Output() primaryButtonClick = new EventEmitter()
	@Output() clearErrors = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false

	constructor(
		private localizationService: LocalizationService,
		@Inject(PLATFORM_ID) private platformId: object
	) { }
	
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
		this.clearErrors.emit()
	}

	submit() {
		this.primaryButtonClick.emit({
			name: this.name
		})
	}
}
