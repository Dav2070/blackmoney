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
import { OrderItem } from "src/app/models/OrderItem"

@Component({
	selector: "app-view-note-dialog",
	templateUrl: "./view-note-dialog.component.html",
	styleUrl: "./view-note-dialog.component.scss",
	standalone: false
})
export class ViewNoteDialogComponent {
	locale = this.localizationService.locale.dialogs.viewNoteDialog
	actionsLocale = this.localizationService.locale.actions
	@Input() orderItem: OrderItem = null
	@Input() showEditButton: boolean = true
	@Output() editButtonClick = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false
	note: string = ""

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
		this.note = this.orderItem.note
		this.visible = true
	}

	hide() {
		this.visible = false
	}

	edit() {
		this.editButtonClick.emit()
		this.hide()
	}
}
