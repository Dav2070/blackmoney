import { Component, Input, Output, EventEmitter } from "@angular/core"
import { OfferType, DiscountType } from "src/app/types"

export interface OfferBasicData {
	id: number
	name: string
	offerType: OfferType
	offerValue: number
	discountType: DiscountType
	takeaway: boolean
}

@Component({
	selector: "app-offer-basic-data",
	templateUrl: "./offer-basic-data.component.html",
	styleUrls: ["./offer-basic-data.component.scss"],
	standalone: false
})
export class OfferBasicDataComponent {
	@Input() data: OfferBasicData = {
		id: 0,
		name: "",
		offerType: "FIXED_PRICE",
		offerValue: 0,
		discountType: "PERCENTAGE",
		takeaway: false
	}
	@Input() loading: boolean = false
	@Input() locale: any
	@Input() idError: string = ""
	@Input() nameError: string = ""
	@Input() offerValueError: string = ""

	@Output() dataChange = new EventEmitter<OfferBasicData>()
	@Output() errorsClear = new EventEmitter<void>()

	idChange(value: string) {
		this.data.id = parseInt(value) || 0
		this.idError = ""
		this.dataChange.emit(this.data)
		this.errorsClear.emit()
	}

	nameChange(value: string) {
		this.data.name = value
		this.nameError = ""
		this.dataChange.emit(this.data)
		this.errorsClear.emit()
	}

	offerTypeChange(value: string) {
		this.data.offerType = value as OfferType
		this.offerValueError = ""
		this.dataChange.emit(this.data)
		this.errorsClear.emit()
	}

	discountTypeChange(value: string) {
		this.data.discountType = value as DiscountType
		this.dataChange.emit(this.data)
	}

	offerValueChange(value: string) {
		this.data.offerValue = parseFloat(value) || 0
		this.offerValueError = ""
		this.dataChange.emit(this.data)
		this.errorsClear.emit()
	}

	takeawayCheckboxChange(value: boolean) {
		this.data.takeaway = value
		this.dataChange.emit(this.data)
	}
}
