import { Component, Input, Output, EventEmitter } from "@angular/core"
import {
	faStar,
	faCupTogo,
	faTruck,
	faChevronLeft,
	faChevronRight,
	faPlus
} from "@fortawesome/pro-regular-svg-icons"
import { Restaurant } from "src/app/models/Restaurant"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-restaurant-details",
	templateUrl: "./restaurant-details.component.html",
	styleUrls: ["./restaurant-details.component.scss"],
	standalone: false
})
export class RestaurantDetailsComponent {
	@Input() restaurant: Restaurant | null = null
	@Input() currentImageUrl: string | null = null
	@Input() currentImageIndex: number = 0

	@Output() reserveTableClick = new EventEmitter<void>()
	@Output() orderNowClick = new EventEmitter<void>()
	@Output() addImageClick = new EventEmitter<void>()
	@Output() previousImageClick = new EventEmitter<void>()
	@Output() nextImageClick = new EventEmitter<void>()
	@Output() setCurrentImageClick = new EventEmitter<number>()

	faStar = faStar
	faCupTogo = faCupTogo
	faTruck = faTruck
	faChevronLeft = faChevronLeft
	faChevronRight = faChevronRight
	faPlus = faPlus

	locale = this.localizationService.locale.restaurantInfoPage

	constructor(private localizationService: LocalizationService) {}

	calculateAverageRating(): number {
		if (!this.restaurant?.ratings || this.restaurant.ratings.length === 0) {
			return 0
		}
		const sum = this.restaurant.ratings.reduce(
			(acc, rating) => acc + rating.value,
			0
		)
		return sum / this.restaurant.ratings.length
	}

	reserveTable() {
		this.reserveTableClick.emit()
	}

	orderNow() {
		this.orderNowClick.emit()
	}

	addImage() {
		this.addImageClick.emit()
	}

	previousImage() {
		this.previousImageClick.emit()
	}

	nextImage() {
		this.nextImageClick.emit()
	}

	setCurrentImage(index: number) {
		this.setCurrentImageClick.emit(index)
	}
}
