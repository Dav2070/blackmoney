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
	selector: "app-add-note-dialog",
	templateUrl: "./add-note-dialog.component.html",
	styleUrl: "./add-note-dialog.component.scss",
	standalone: false
})
export class AddNoteDialogComponent {
	locale = this.localizationService.locale.dialogs.addNoteDialog
	actionsLocale = this.localizationService.locale.actions
	@Input() orderItem: OrderItem = null
	@Output() primaryButtonClick = new EventEmitter()
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
		this.note = this.orderItem?.notes || ""
		this.visible = true
	}

	hide() {
		this.visible = false
		this.note = ""
	}

	noteTextareaChange(event: Event) {
		this.note = (event as CustomEvent).detail.value
	}

	submit() {
		this.primaryButtonClick.emit({
			note: this.note
		})
		this.hide()
	}
}
