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
	selector: "app-add-variation-item-dialog",
	templateUrl: "./add-variation-item-dialog.component.html",
	styleUrls: ["./add-variation-item-dialog.component.scss"],
	standalone: false
})
export class AddVariationItemDialogComponent {
	locale = this.localizationService.locale.dialogs.addVariationItemDialog
	actionsLocale = this.localizationService.locale.actions
	@Input() loading: boolean = false
	@Input() name: string = ""
	@Input() additionalCost: number = 0
	@Input() nameError: string = ""
	@Input() costError: string = ""
	@Output() primaryButtonClick = new EventEmitter<{
		name: string
		additionalCost: number
	}>()
	@Output() clearErrors = new EventEmitter()
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
		this.name = ""
		this.additionalCost = 0
		this.nameError = ""
		this.costError = ""
	}

	submit() {
		// Validierung
		if (!this.name.trim()) {
			this.nameError = "Name ist erforderlich"
			return
		}

		if (this.additionalCost < 0) {
			this.costError = "Preis muss positiv sein"
			return
		}

		this.primaryButtonClick.emit({
			name: this.name,
			additionalCost: this.additionalCost
		})
	}

	nameTextfieldChange(newValue: string) {
		this.name = newValue
		this.clearErrors.emit()
	}

	costTextfieldChange(newValue: string) {
		this.additionalCost = parseFloat(newValue) || 0
		this.clearErrors.emit()
	}
}
