import {
	Component,
	Input,
	ElementRef,
	EventEmitter,
	Output,
	ViewChild
} from "@angular/core"
import { FormControl } from "@angular/forms"
import { faPen } from "@fortawesome/pro-regular-svg-icons"
import { Dialog } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"
import { Table, TableCombination } from "src/app/models/Table"

@Component({
	templateUrl: "./table-combination-page.component.html",
	styleUrl: "./table-combination-page.component.scss",
	standalone: false
})
export class TableCombinationPageComponent {
	tablesLocale = this.localizationService.locale.tablesCombinationPage
	actionsLocale = this.localizationService.locale.actions
	locale = this.localizationService.locale.dialogs.addTableCombinationDialog

	faPen = faPen

	table: Table[] = [
		{ uuid: "", name: 1, seats: 4 },
		{ uuid: "", name: 2, seats: 4 },
		{ uuid: "", name: 3, seats: 6 }
	]
	tableCombination: TableCombination[] = []
	selectedTable: TableCombination | null = null
	tableCombinations = new FormControl<number[]>([])

	@Input() loading: boolean = false
	@Input() name: number[] = []
	@Input() line1Error: string = ""
	@Input() seats: number = null
	@Input() line2Error: string = ""
	@Output() clearErrors = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	@Input() bulkMode = false
	visible: boolean = false
	showAllForm = false

	constructor(private localizationService: LocalizationService) {}

	chairNumberfieldChange(event: Event) {
		this.seats = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	show() {
		this.visible = true
	}

	hide() {
		this.visible = false
	}

	addTableCombination() {
		this.name = this.tableCombinations.value ?? [] // Nummer wird gespeichert (1,2,3)

		// fügt die Tischkombination hinzu
		const tableCombination: TableCombination = {
			uuid: "",
			name: this.name,
			seats: this.seats
		}
		this.tableCombination.push(tableCombination)
		this.cancelEdit()
	}

	openEditForm(tableCombination: TableCombination) {
		this.selectedTable = tableCombination
		// Formular mit bestehenden Werten füllen
		this.tableCombinations.setValue(tableCombination.name)
		this.seats = tableCombination.seats
		this.showAllForm = false
		this.visible = true
	}

	updateTableCombination() {
		if (!this.selectedTable) {
			return
		}
		this.name = this.tableCombinations.value ?? [] // Nummer wird gespeichert (1,2,3)
		this.selectedTable.name = this.name
		this.selectedTable.seats = this.seats
		this.cancelEdit()
	}

	submitTableCombination() {
		if (this.selectedTable) {
			this.updateTableCombination()
		} else {
			this.addTableCombination()
		}
	}

	cancelEdit() {
		this.showAllForm = true
		this.visible = false
		this.name = []
		this.seats = null
		this.tableCombinations.setValue([])
	}

	removeTableCombination(tableCombinations: TableCombination) {
		const idx = this.tableCombination.findIndex(
			tc => tc.name === tableCombinations.name
		)
		if (idx > -1) {
			this.tableCombination.splice(idx, 1)
		}

		if (this.tableCombination.length === 0) {
			this.tableCombination = []
			this.selectedTable = null
		}

		this.cancelEdit()
	}
}
