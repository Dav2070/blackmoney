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
  selector: 'app-edit-owner-dialog',
  templateUrl: './edit-owner-dialog.component.html',
  styleUrl: './edit-owner-dialog.component.scss',
  standalone: false
})
export class EditOwnerDialogComponent {
locale = this.localizationService.locale.dialogs.editAddressDialog
	actionsLocale = this.localizationService.locale.actions
	@Input() loading: boolean = false
	@Input() line1: string = ""
	@Input() line1Error: string = ""
	@Input() line2: string = ""
	@Input() line2Error: string = ""
	@Output() primaryButtonClick = new EventEmitter()
	@Output() clearErrors = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false

	@Input() line1Name: string = ""
	@Input() line2Name: string = ""

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

	line1TextfieldChange(event: Event) {
		this.line1 = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	line2TextfieldChange(event: Event) {
		this.line2 = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	submit() {
		this.primaryButtonClick.emit({
			line1: this.line1,
			line2: this.line2
		})
	}
}


