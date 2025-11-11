import {
	Component,
	Input,
	Output,
	ViewChild,
	EventEmitter,
	ElementRef,
	Inject,
	PLATFORM_ID
} from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { Dialog } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-reset-password-dialog",
	templateUrl: "./reset-password-dialog.component.html",
	standalone: false
})
export class ResetPasswordDialogComponent {
	locale = this.localizationService.locale.dialogs.resetPasswordDialog
	actionsLocale = this.localizationService.locale.actions
	visible: boolean = false

	@Input() loading: boolean = false
	@Input() name: string = ""
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

	submit() {
		this.primaryButtonClick.emit()
	}
}
