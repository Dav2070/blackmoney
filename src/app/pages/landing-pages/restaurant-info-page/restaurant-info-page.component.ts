import { Component, EventEmitter, Output } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { CommonModule } from "@angular/common"
import {
	faStar,
	faCupTogo,
	faTruck,
	faSearch,
	faChevronLeft,
	faChevronRight
} from "@fortawesome/pro-regular-svg-icons"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome"
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core"

@Component({
	templateUrl: "./restaurant-info-page.component.html",
	styleUrls: ["./restaurant-info-page.component.scss"],
	standalone: true,
	imports: [CommonModule, FontAwesomeModule],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RestaurantInfoPageComponent {
	uuid: string | null = null

	// filters
	nameFilter: string = ""
	cityPostalFilter: string = ""
	distanceKm: number = 10
	ratingFilter: number = 0
	hasTakeaway: boolean = false
	hasDelivery: boolean = false

	faStar = faStar
	faCupTogo = faCupTogo
	faTruck = faTruck
	faSearch = faSearch
	faChevronLeft = faChevronLeft
	faChevronRight = faChevronRight

	// Restaurant data
	restaurant: any = null
	menu: any = null
	ratings: any[] = []
	currentImageIndex: number = 0
	currentImageUrl: string | null = null

	@Output() filtersChanged = new EventEmitter<{
		name: string
		cityPostal: string
		distanceKm: number
		rating: number
		hasTakeaway: boolean
		hasDelivery: boolean
	}>()

	private emitTimer: any = null

	constructor(
		private route: ActivatedRoute,
		private router: Router
	) {
		this.uuid = this.route.snapshot.paramMap.get("uuid")
		this.loadRestaurantData()
	}

	nameTextfieldChange(value: string) {
		this.nameFilter = value
		this.scheduleEmitFilters()
	}

	cityTextfieldChange(value: string) {
		this.cityPostalFilter = value
		this.scheduleEmitFilters()
	}

	distanceRangeChange(value: string) {
		this.distanceKm = Number(value)
		this.scheduleEmitFilters()
	}

	setRating(value: number) {
		this.ratingFilter = value
		this.scheduleEmitFilters()
	}

	takeawayCheckboxChange(checked: boolean) {
		this.hasTakeaway = checked
		this.scheduleEmitFilters()
	}

	deliveryCheckboxChange(checked: boolean) {
		this.hasDelivery = checked
		this.scheduleEmitFilters()
	}

	private scheduleEmitFilters() {
		if (this.emitTimer) {
			clearTimeout(this.emitTimer)
		}
		this.emitTimer = setTimeout(() => {
			this.filtersChanged.emit({
				name: this.nameFilter,
				cityPostal: this.cityPostalFilter,
				distanceKm: this.distanceKm,
				rating: this.ratingFilter,
				hasTakeaway: this.hasTakeaway,
				hasDelivery: this.hasDelivery
			})
		}, 250)
	}

	search() {
		this.router.navigate(["guests"], {
			queryParams: {
				name: this.nameFilter || null,
				cityPostal: this.cityPostalFilter || null,
				distanceKm: this.distanceKm,
				rating: this.ratingFilter,
				hasTakeaway: this.hasTakeaway,
				hasDelivery: this.hasDelivery
			},
			queryParamsHandling: "merge"
		})
	}

	private loadRestaurantData() {
		// Load restaurant data from localStorage (set by landing-guests-page)
		const storedData = localStorage.getItem("selectedRestaurant")
		if (storedData) {
			try {
				this.restaurant = JSON.parse(storedData)
				// Add sample images if not present
				if (
					!this.restaurant.images ||
					this.restaurant.images.length === 0
				) {
					this.restaurant.images = [
						"https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Restaurant+Bild",
						"https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Restaurant+Interior",
						"https://via.placeholder.com/400x300/45B7D1/FFFFFF?text=Restaurant+Menu"
					]
				}
			} catch (error) {
				console.error("Error parsing restaurant data:", error)
				this.loadFallbackData()
			}
		} else {
			this.loadFallbackData()
		}
		this.loadMenuData()
		this.loadRatingsData()
		this.updateCurrentImage()
	}

	private loadFallbackData() {
		// Fallback data if no stored data is available
		this.restaurant = {
			name: "Restaurant",
			addressLine1: "Adresse nicht verfügbar",
			postalCode: "",
			city: "",
			hasTakeaway: false,
			hasDelivery: false,
			images: [
				"https://via.placeholder.com/400x300/CCCCCC/FFFFFF?text=Kein+Bild"
			]
		}
	}

	private loadMenuData() {
		// Load or create sample menu data
		this.menu = {
			categories: [
				{
					name: "Vorspeisen",
					products: [
						{ name: "Caesar Salad", price: 8.50 },
						{ name: "Tomato Soup", price: 6.00 },
						{ name: "Garlic Bread", price: 5.50 }
					]
				},
				{
					name: "Hauptgerichte",
					products: [
						{ name: "Grilled Salmon", price: 18.00 },
						{ name: "Beef Steak", price: 22.00 },
						{ name: "Pasta Carbonara", price: 14.50 }
					]
				},
				{
					name: "Desserts",
					products: [
						{ name: "Tiramisu", price: 7.00 },
						{ name: "Chocolate Cake", price: 6.50 },
						{ name: "Ice Cream", price: 5.00 }
					]
				}
			]
		}
	}

	private loadRatingsData() {
		// Load or create sample ratings data
		this.ratings = [
			{
				value: 5,
				review: "Ausgezeichnetes Essen und toller Service! Wir kommen gerne wieder.",
				userName: "Anna M."
			},
			{
				value: 4,
				review: "Sehr gutes Restaurant mit freundlichem Personal. Das Essen war lecker.",
				userName: "Michael K."
			},
			{
				value: 5,
				review: "Fantastische Atmosphäre und hervorragende Qualität. Absolut empfehlenswert!",
				userName: "Sarah L."
			},
			{
				value: 4,
				review: "Gutes Preis-Leistungs-Verhältnis. Die Portionen waren großzügig.",
				userName: "Thomas B."
			}
		]
	}

	private updateCurrentImage() {
		if (this.restaurant?.images && this.restaurant.images.length > 0) {
			this.currentImageUrl = this.restaurant.images[this.currentImageIndex]
		} else {
			this.currentImageUrl = null
		}
	}

	previousImage() {
		if (this.restaurant?.images && this.restaurant.images.length > 0) {
			this.currentImageIndex =
				(this.currentImageIndex - 1 + this.restaurant.images.length) %
				this.restaurant.images.length
			this.updateCurrentImage()
		}
	}

	nextImage() {
		if (this.restaurant?.images && this.restaurant.images.length > 0) {
			this.currentImageIndex =
				(this.currentImageIndex + 1) % this.restaurant.images.length
			this.updateCurrentImage()
		}
	}

	setCurrentImage(index: number) {
		if (
			this.restaurant?.images &&
			index >= 0 &&
			index < this.restaurant.images.length
		) {
			this.currentImageIndex = index
			this.updateCurrentImage()
		}
	}

	reserveTable() {
		// TODO: Implement reservation functionality
		console.log("Reservierung wird implementiert...")
	}

	orderNow() {
		// TODO: Implement ordering functionality
		console.log("Bestellung wird implementiert...")
	}

	calculateAverageRating(): number {
		if (!this.ratings || this.ratings.length === 0) {
			return 0
		}
		const sum = this.ratings.reduce((acc, rating) => acc + rating.value, 0)
		return sum / this.ratings.length
	}
}
