import { Component, EventEmitter, Output, Input } from "@angular/core"
import { Router } from "@angular/router"
import {
	faStar,
	faSearch,
	faArrowLeft
} from "@fortawesome/pro-regular-svg-icons"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-restaurant-filters",
	templateUrl: "./restaurant-filters.component.html",
	styleUrls: ["./restaurant-filters.component.scss"],
	standalone: false
})
export class RestaurantFiltersComponent {
	@Input() nameFilter: string = ""
	@Input() cityPostalFilter: string = ""
	@Input() distanceKm: number = 10
	@Input() ratingFilter: number = 0
	@Input() hasTakeaway: boolean = false
	@Input() hasDelivery: boolean = false

	@Output() nameFilterChange = new EventEmitter<string>()
	@Output() cityPostalFilterChange = new EventEmitter<string>()
	@Output() distanceKmChange = new EventEmitter<number>()
	@Output() ratingFilterChange = new EventEmitter<number>()
	@Output() hasTakeawayChange = new EventEmitter<boolean>()
	@Output() hasDeliveryChange = new EventEmitter<boolean>()
	@Output() searchClick = new EventEmitter<void>()
	@Output() backClick = new EventEmitter<void>()

	faStar = faStar
	faSearch = faSearch
	faArrowLeft = faArrowLeft

	locale = this.localizationService.locale.restaurantInfoPage

	constructor(
		private localizationService: LocalizationService,
		private router: Router
	) {}

	nameTextfieldChange(value: string) {
		this.nameFilterChange.emit(value)
	}

	cityTextfieldChange(value: string) {
		this.cityPostalFilterChange.emit(value)
	}

	distanceRangeChange(value: string) {
		this.distanceKmChange.emit(Number(value))
	}

	setRating(value: number) {
		this.ratingFilterChange.emit(value)
	}

	takeawayCheckboxChange(checked: boolean) {
		this.hasTakeawayChange.emit(checked)
	}

	deliveryCheckboxChange(checked: boolean) {
		this.hasDeliveryChange.emit(checked)
	}

	search() {
		this.searchClick.emit()
	}

	goBack() {
		this.backClick.emit()
	}
}
