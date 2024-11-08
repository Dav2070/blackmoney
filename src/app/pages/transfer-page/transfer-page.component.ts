import { Component } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { AllItemHandler } from "src/app/models/all-item-handler.model"
import { Item } from "src/app/models/item.model"
import { PickedItem } from "src/app/models/picked-item.model"
import { Variation } from "src/app/models/variation.model"
import { HardcodeService } from "src/app/services/hardcode-service"

@Component({
	templateUrl: "./transfer-page.component.html",
	styleUrl: "./transfer-page.component.scss"
})
export class TransferPageComponent {
	date: String = new Date().toLocaleString("de-DE")
	bediener: String = "Bediener 1"

	numberpad: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
	bookedItemsLeft = new AllItemHandler()
	bookedItemsRight = new AllItemHandler()
	tableLeftUuid: number
	tableRightUuid: number
	console: string
	consoleActive: boolean = false
	isItemPopupVisible: boolean = false
	lastClickedItem: PickedItem
	tmpVariations = new Map<number, Variation>()
	tmpAnzahl: number

	tmpSend: AllItemHandler
	tmpReceiver: AllItemHandler

	constructor(
		private hardcodeService: HardcodeService,
		private activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		this.tableLeftUuid = +this.activatedRoute.snapshot.paramMap.get("uuid")
		this.tableRightUuid =
			+this.activatedRoute.snapshot.paramMap.get("console")
		this.bookedItemsLeft = this.hardcodeService.getItemsofTable(40)
		this.bookedItemsRight = this.hardcodeService.getItemsofTable(50)
	}

	//Berechnet den Preis aller Items eines Tisches
	showTotal(bookedItems: AllItemHandler) {
		return bookedItems.calculatTotal().toFixed(2) + "€"
	}

	//Fügt die gedrückte Nummer in die Konsole ein
	consoleInput(input: string) {
		if (this.consoleActive == false) {
			this.consoleActive = true
			this.console = ""
		}
		this.console += input
	}

	clearInput() {
		this.console = ""
		this.consoleActive = false
	}

	transferItem(
		item: PickedItem,
		send: AllItemHandler,
		receiving: AllItemHandler
	) {
		let anzahl = 0
		if (this.consoleActive) {
			anzahl = parseInt(this.console)
		}
		if (item.pickedVariation) {
			if (anzahl > item.anzahl) {
				window.alert(
					"Es können maximal " + item.anzahl + " Items übertragen werden"
				)
			} else {
				this.lastClickedItem = { ...item }
				this.tmpSend = send
				this.tmpReceiver = receiving

				this.isItemPopupVisible = true
				if (anzahl > 0) {
					this.tmpAnzahl = anzahl
				}
			}
		} else {
			if (anzahl === 0) {
				anzahl = 1
			}
			if (anzahl > item.anzahl) {
				window.alert(
					"Es können nur maximal " + item.anzahl + " übertragen werden"
				)
			} else {
				send.reduceItem(item, anzahl)
				receiving.pushNewItem(
					new PickedItem(
						{ id: item.id, price: item.price, name: item.name },
						anzahl
					)
				)
			}
		}
		this.clearInput()
	}

	//Entfernt eine Variation
	removeVariation(variation: Variation) {
		if (variation.anzahl === 1) {
			this.tmpVariations.delete(variation.id)
		} else {
			this.tmpVariations.get(variation.id).anzahl -= 1
		}
	}

	//Checkt ob Limit der Anzahl erreicht ist
	checkLimitAnzahl(id: number) {
		let anzahl = this.lastClickedItem.pickedVariation.get(id).anzahl
		if (this.tmpAnzahl > 0) {
			anzahl = this.tmpAnzahl
		}

		if (this.tmpVariations.has(id)) {
			if (anzahl === this.tmpVariations.get(id).anzahl) {
				return true
			}
		}

		return false
	}

	//Erhöht eine Variation um eins
	addVariation(variation: Variation) {
		if (this.tmpVariations.has(variation.id)) {
			this.tmpVariations.get(variation.id).anzahl += 1
		} else {
			this.tmpVariations.set(variation.id, { ...variation, anzahl: 1 })
		}
	}

	//Checkt ob mindestens eine Variation ausgewählt wurde oder die Anzahl an Variationen ausgewählt wurde die man buchen möchte
	checkPickedVariation() {
		if (this.tmpAnzahl > 0) {
			let anzahl = 0
			for (let variation of this.tmpVariations.values()) {
				anzahl += variation.anzahl
			}
			if (anzahl === this.tmpAnzahl) {
				return false
			}
		} else {
			for (let variation of this.tmpVariations.values()) {
				if (variation.anzahl > 0) {
					return false
				}
			}
		}
		return true
	}

	//Schließt Popup und setzt alle Variablen default
	closeItemPopup() {
		this.isItemPopupVisible = !this.isItemPopupVisible
		this.tmpVariations.clear()
		this.lastClickedItem = undefined
		this.tmpAnzahl = 0
	}

	//Fügt die ausgewählten Items mit Variationen zum anderen Tisch
	sendVariation() {
		let number = 0
		for (let variation of this.tmpVariations.values()) {
			number += variation.anzahl
		}
		this.tmpReceiver.pushNewItem(
			new PickedItem(
				this.lastClickedItem,
				number,
				new Map(this.tmpVariations)
			)
		)
		this.tmpSend.reduceItem(
			new PickedItem(
				this.lastClickedItem,
				number,
				new Map(this.tmpVariations)
			),
			number
		)
		this.closeItemPopup()
	}
}
