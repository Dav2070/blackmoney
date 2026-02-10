import { Component, Input, Output, EventEmitter } from "@angular/core"
import { faStar } from "@fortawesome/pro-regular-svg-icons"
import { Restaurant } from "src/app/models/Restaurant"
import { Rating } from "src/app/models/Rating"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-restaurant-reviews",
	templateUrl: "./restaurant-reviews.component.html",
	styleUrls: ["./restaurant-reviews.component.scss"],
	standalone: false
})
export class RestaurantReviewsComponent {
	@Input() restaurant: Restaurant | null = null

	@Output() addReviewClick = new EventEmitter<void>()
	@Output() openReviewsDialogClick = new EventEmitter<void>()

	faStar = faStar

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

	addReview() {
		this.addReviewClick.emit()
	}

	openReviewsDialog() {
		this.openReviewsDialogClick.emit()
	}
}
