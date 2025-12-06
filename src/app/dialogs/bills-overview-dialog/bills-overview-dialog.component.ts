import {
	Component,
	Output,
	EventEmitter,
	ViewChild,
	ElementRef,
	Inject,
	PLATFORM_ID
 } from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { Dialog } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-bills-overview-dialog",
	templateUrl: "./bills-overview-dialog.component.html",
	styleUrl: "./bills-overview-dialog.component.scss",
	standalone: false
})
export class BillsOverviewDialogComponent {
	locale = this.localizationService.locale.dialogs.billsOverviewDialog
	actionsLocale = this.localizationService.locale.actions
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	@Output() primaryButtonClick = new EventEmitter()
	visible: boolean = false

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
}
