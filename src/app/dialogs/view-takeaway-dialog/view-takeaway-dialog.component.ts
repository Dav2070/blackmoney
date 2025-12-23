import {
	Component,
	ElementRef,
	EventEmitter,
	Inject,
	Output,
	PLATFORM_ID,
	ViewChild
} from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { Dialog } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"
import { TakeawayDetails } from "src/app/models/TakeawayDetails"

@Component({
	selector: "app-view-takeaway-dialog",
	templateUrl: "./view-takeaway-dialog.component.html",
	styleUrl: "./view-takeaway-dialog.component.scss",
	standalone: false
})
export class ViewTakeawayDialogComponent {
	locale = this.localizationService.locale.dialogs.viewTakeawayDialog
	actionsLocale = this.localizationService.locale.actions
	@Output() editButtonClick = new EventEmitter<TakeawayDetails>()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false
	takeawayDetails: TakeawayDetails = null

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

	show(takeawayDetails: TakeawayDetails) {
		this.takeawayDetails = takeawayDetails
		this.visible = true
	}

	hide() {
		this.visible = false
	}

	edit() {
		this.editButtonClick.emit(this.takeawayDetails)
		this.hide()
	}
}
