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
import { VariationItem } from "src/app/models/VariationItem"

@Component({
	selector: "app-edit-variation-item-dialog",
	templateUrl: "./edit-variation-item-dialog.component.html",
	styleUrls: ["./edit-variation-item-dialog.component.scss"],
	standalone: false
})
export class EditVariationItemDialogComponent {
	locale = this.localizationService.locale.dialogs.editVariationItemDialog
	actionsLocale = this.localizationService.locale.actions

	@Input() loading: boolean = false
	@Input() nameError: string = ""
	@Input() costError: string = ""
	@Output() primaryButtonClick = new EventEmitter<{
		uuid: string
		name: string
		additionalCost: number
	}>()
	@Output() clearErrors = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>

	visible: boolean = false
	item: VariationItem = null
	name: string = ""
	additionalCost: number = 0

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

	show(item: VariationItem) {
		this.item = item
		this.name = item.name
		this.additionalCost = item.additionalCost
		this.visible = true
	}

	hide() {
		this.visible = false
		this.reset()
	}

	reset() {
		this.item = null
		this.name = ""
		this.additionalCost = 0
		this.nameError = ""
		this.costError = ""
	}

	submit() {
		if (!this.name.trim()) {
			this.nameError = this.locale.nameRequired
			return
		}

		if (this.additionalCost < 0) {
			this.costError = this.locale.costPositive
			return
		}

		this.primaryButtonClick.emit({
			uuid: this.item.uuid,
			name: this.name,
			additionalCost: this.additionalCost
		})
	}

	nameTextfieldChange(newValue: string) {
		this.name = newValue
		this.nameError = ""
		this.clearErrors.emit()
	}

	costTextfieldChange(newValue: string) {
		this.additionalCost = parseFloat(newValue) || 0
		this.costError = ""
		this.clearErrors.emit()
	}
}
