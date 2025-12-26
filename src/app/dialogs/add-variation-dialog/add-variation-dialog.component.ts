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
import { faTrash } from "@fortawesome/free-solid-svg-icons"

@Component({
	selector: "app-add-variation-dialog",
	templateUrl: "./add-variation-dialog.component.html",
	styleUrls: ["./add-variation-dialog.component.scss"],
	standalone: false
})
export class AddVariationDialogComponent {
	locale = this.localizationService.locale.dialogs.addVariationDialog
	actionsLocale = this.localizationService.locale.actions
	faTrash = faTrash

	@Input() loading: boolean = false
	@Input() nameError: string = ""
	@Output() primaryButtonClick = new EventEmitter<{
		name: string
		variationItems: VariationItem[]
	}>()
	@Output() clearErrors = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>

	visible: boolean = false
	name: string = ""
	variationItems: VariationItem[] = []

	// Temp fields for new item
	newItemName: string = ""
	newItemCost: number = 0
	newItemNameError: string = ""
	newItemCostError: string = ""

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
		this.reset()
	}

	reset() {
		this.name = ""
		this.variationItems = []
		this.newItemName = ""
		this.newItemCost = 0
		this.nameError = ""
		this.newItemNameError = ""
		this.newItemCostError = ""
	}

	submit() {
		if (!this.name.trim()) {
			this.nameError = this.locale.nameRequired
			return
		}

		if (this.variationItems.length === 0) {
			this.newItemNameError = this.locale.itemsRequired
			return
		}

		this.primaryButtonClick.emit({
			name: this.name,
			variationItems: this.variationItems
		})
	}

	nameTextfieldChange(newValue: string) {
		this.name = newValue
		this.nameError = ""
		this.clearErrors.emit()
	}

	newItemNameChange(newValue: string) {
		this.newItemName = newValue
		this.newItemNameError = ""
	}

	newItemCostChange(newValue: string) {
		this.newItemCost = parseFloat(newValue) || 0
		this.newItemCostError = ""
	}

	addVariationItem() {
		if (!this.newItemName.trim()) {
			this.newItemNameError = this.locale.itemNameRequired
			return
		}

		const newItem: VariationItem = {
			id: Date.now(),
			uuid: crypto.randomUUID(),
			name: this.newItemName,
			additionalCost: this.newItemCost
		}

		this.variationItems.push(newItem)

		// Reset temp fields
		this.newItemName = ""
		this.newItemCost = 0
		this.newItemNameError = ""
		this.newItemCostError = ""
	}

	removeVariationItem(item: VariationItem) {
		this.variationItems = this.variationItems.filter(
			i => i.uuid !== item.uuid
		)
	}
}
