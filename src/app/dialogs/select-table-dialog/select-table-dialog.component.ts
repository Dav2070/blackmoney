import { Component, PLATFORM_ID, Inject, ViewChild, ElementRef } from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { Dialog } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-select-table-dialog",
	templateUrl: "./select-table-dialog.component.html",
	styleUrl: "./select-table-dialog.component.scss",
	standalone: false
})
export class SelectTableDialogComponent {
	locale = this.localizationService.locale.dialogs.selectTableDialog
	actionsLocale = this.localizationService.locale.actions
	@ViewChild("dialog") dialog: ElementRef<Dialog>
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

	submit() {}
}
