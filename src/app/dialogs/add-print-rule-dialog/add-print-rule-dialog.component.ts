import {
	Component,
	ElementRef,
	Input,
	Output,
	ViewChild,
	EventEmitter,
	Inject,
	PLATFORM_ID
} from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { Dialog } from "dav-ui-components"
import { DataService } from "src/app/services/data-service"
import { ApiService } from "src/app/services/api-service"
import { LocalizationService } from "src/app/services/localization-service"
import { PrinterResource } from "src/app/types"

export type SelectedPrintRuleType =
	| "bills"
	| "allFoodAndDrinks"
	| "allDrinks"
	| "allFood"

@Component({
	selector: "app-add-print-rule-dialog",
	templateUrl: "./add-print-rule-dialog.component.html",
	styleUrl: "./add-print-rule-dialog.component.scss",
	standalone: false
})
export class AddPrintRuleDialogComponent {
	locale = this.localizationService.locale.dialogs.addPrintRuleDialog
	actionsLocale = this.localizationService.locale.actions

	@Input() loading: boolean = false
	@Input() restaurantUuid: string = ""
	@Output() primaryButtonClick = new EventEmitter<{
		printerUuids: string[]
		printRuleType: SelectedPrintRuleType
	}>()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false
	selectedPrintRuleType: SelectedPrintRuleType = "bills"

	printers: {
		key: string
		value: string
	}[] = []
	selectedPrinters: {
		key: string
		value: string
	}[] = []

	constructor(
		private dataService: DataService,
		private apiService: ApiService,
		private localizationService: LocalizationService,
		@Inject(PLATFORM_ID) private platformId: object
	) {}

	async ngAfterViewInit() {
		if (isPlatformBrowser(this.platformId)) {
			document.body.appendChild(this.dialog.nativeElement)
		}

		await this.dataService.blackmoneyUserPromiseHolder.AwaitResult()
		await this.dataService.restaurantPromiseHolder.AwaitResult()

		const searchPrintersResponse = await this.apiService.searchPrinters(
			`
				items {
					uuid
					name
				}
			`,
			{
				restaurantUuid: this.restaurantUuid,
				query: ""
			}
		)

		if (searchPrintersResponse.data.searchPrinters != null) {
			this.printers = searchPrintersResponse.data.searchPrinters.items.map(
				(printer: PrinterResource) => ({
					key: printer.uuid,
					value: printer.name
				})
			)
		}
	}

	ngOnDestroy() {
		if (isPlatformBrowser(this.platformId)) {
			document.body.removeChild(this.dialog.nativeElement)
		}
	}

	printersSearchTextfieldSelect(event: Event) {
		const result = (event as CustomEvent).detail.result
		this.selectedPrinters.push(result)
	}

	removeSelectedPrinter(uuid: string) {
		const i = this.selectedPrinters.findIndex(p => p.key === uuid)
		if (i !== -1) this.selectedPrinters.splice(i, 1)
	}

	radioGroupChange(event: Event) {
		this.selectedPrintRuleType = (event as CustomEvent).detail
			.checked as SelectedPrintRuleType
	}

	show() {
		this.visible = true
	}

	hide() {
		this.visible = false
	}

	submit() {
		this.primaryButtonClick.emit({
			printerUuids: this.selectedPrinters.map(p => p.key),
			printRuleType: this.selectedPrintRuleType
		})
	}
}
