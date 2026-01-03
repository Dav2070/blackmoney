import {
	Component,
	EventEmitter,
	Output,
	Inject,
	PLATFORM_ID
} from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { isPlatformBrowser } from "@angular/common"
import {
	faStar,
	faCupTogo,
	faTruck,
	faSearch,
	faChevronLeft,
	faChevronRight,
	faList,
	faPlus
} from "@fortawesome/pro-regular-svg-icons"
import { Restaurant } from "src/app/models/Restaurant"
import { Rating } from "src/app/models/Rating"
import { Menu } from "src/app/models/Menu"
import { Product } from "src/app/models/Product"
import { ViewChild } from "@angular/core"
import { ViewMenuDialogComponent } from "src/app/dialogs/view-menu-dialog/view-menu-dialog.component"
import { ViewReviewsDialogComponent } from "src/app/dialogs/view-reviews-dialog/view-reviews-dialog.component"
import { UploadImageDialogComponent } from "src/app/dialogs/upload-image-dialog/upload-image-dialog.component"
import { AddReviewDialogComponent } from "src/app/dialogs/add-review-dialog/add-review-dialog.component"
import { Variation } from "src/app/models/Variation"
import { formatPrice } from "src/app/utils"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	templateUrl: "./restaurant-info-page.component.html",
	styleUrls: ["./restaurant-info-page.component.scss"],
	standalone: false
})
export class RestaurantInfoPageComponent {
	@ViewChild(ViewMenuDialogComponent) viewMenuDialog: ViewMenuDialogComponent
	@ViewChild(ViewReviewsDialogComponent)
	viewReviewsDialog: ViewReviewsDialogComponent
	@ViewChild(UploadImageDialogComponent)
	uploadImageDialog: UploadImageDialogComponent
	@ViewChild(AddReviewDialogComponent)
	addReviewDialog: AddReviewDialogComponent

	uuid: string | null = null
	formatPrice = formatPrice
	locale = this.localizationService.locale.restaurantInfoPage

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
	faList = faList
	faPlus = faPlus

	// Restaurant data
	restaurant: Restaurant = null
	bestsellers: Menu = null
	topProducts: Product[] = []

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
		private localizationService: LocalizationService,
		private router: Router,
		@Inject(PLATFORM_ID) private platformId: object
	) {
		this.uuid = this.route.snapshot.paramMap.get("uuid")
	}

	ngOnInit() {
		// Always load bestsellers and ratings (sample data)
		this.loadBestSellersData()

		// Load restaurant data from localStorage only in browser
		if (isPlatformBrowser(this.platformId)) {
			this.loadRestaurantFromStorage()
		}
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

	openMenuDialog() {
		if (this.viewMenuDialog && this.restaurant?.menu) {
			this.viewMenuDialog.menu = this.restaurant.menu
			this.viewMenuDialog.open()
		}
	}

	openReviewsDialog() {
		if (this.viewReviewsDialog) {
			this.viewReviewsDialog.ratings = this.restaurant?.ratings || []
			this.viewReviewsDialog.open()
		}
	}

	addReview() {
		if (this.addReviewDialog) {
			this.addReviewDialog.open()
		}
	}

	onReviewSubmitted(rating: Rating) {
		// Initialize ratings array if it doesn't exist
		if (!this.restaurant.ratings) {
			this.restaurant.ratings = []
		}

		// Add to beginning of ratings array
		this.restaurant.ratings.unshift(rating)
	}

	private loadRestaurantFromStorage() {
		// Load restaurant data from localStorage (set by landing-guests-page)
		const storedData = localStorage.getItem("selectedRestaurant")
		if (storedData) {
			try {
				this.restaurant = JSON.parse(storedData)
			} catch (error) {
				console.error("Error parsing restaurant data:", error)
			}
		}

		// Always initialize ratings with sample data if not present or empty
		if (
			this.restaurant &&
			(!this.restaurant.ratings || this.restaurant.ratings.length === 0)
		) {
			this.loadRatingsData()
		}

		this.updateCurrentImage()
	}

	private loadBestSellersData() {
		// TODO: Load top 5 bestsellers from API
		// For now, create sample data with top 5 products
		this.topProducts = [
			{
				uuid: crypto.randomUUID(),
				shortcut: 1,
				type: "FOOD",
				name: "Caesar Salad",
				price: 850,
				category: undefined,
				variations: [
					{
						uuid: crypto.randomUUID(),
						name: "Größe",
						variationItems: [
							{
								id: 1,
								uuid: crypto.randomUUID(),
								name: "Klein",
								additionalCost: 0
							},
							{
								id: 2,
								uuid: crypto.randomUUID(),
								name: "Groß",
								additionalCost: 200
							}
						]
					}
				]
			},
			{
				uuid: crypto.randomUUID(),
				shortcut: 2,
				type: "FOOD",
				name: "Grilled Salmon",
				price: 1800,
				category: undefined,
				variations: []
			},
			{
				uuid: crypto.randomUUID(),
				shortcut: 3,
				type: "FOOD",
				name: "Beef Steak",
				price: 2200,
				category: undefined,
				variations: [
					{
						uuid: crypto.randomUUID(),
						name: "Garstufe",
						variationItems: [
							{
								id: 3,
								uuid: crypto.randomUUID(),
								name: "Medium",
								additionalCost: 0
							},
							{
								id: 4,
								uuid: crypto.randomUUID(),
								name: "Well Done",
								additionalCost: 0
							}
						]
					}
				]
			},
			{
				uuid: crypto.randomUUID(),
				shortcut: 4,
				type: "FOOD",
				name: "Margherita Pizza",
				price: 1250,
				category: undefined,
				variations: []
			},
			{
				uuid: crypto.randomUUID(),
				shortcut: 5,
				type: "FOOD",
				name: "Pasta Carbonara",
				price: 1400,
				category: undefined,
				variations: []
			}
		]

		// Create a complete menu offer with offer items
		this.bestsellers = {
			uuid: crypto.randomUUID(),
			categories: [],
			variations: [],
			offers: [
				{
					id: 1,
					uuid: crypto.randomUUID(),
					offerType: "FIXED_PRICE",
					offerValue: 45,
					weekdays: [
						"MONDAY",
						"TUESDAY",
						"WEDNESDAY",
						"THURSDAY",
						"FRIDAY",
						"SATURDAY",
						"SUNDAY"
					],
					offerItems: [
						{
							uuid: crypto.randomUUID(),
							name: "Hauptgericht",
							maxSelections: 2,
							products: [
								{
									uuid: crypto.randomUUID(),
									shortcut: 10,
									type: "FOOD",
									name: "Grilled Chicken",
									price: 1600,
									category: undefined,
									variations: []
								},
								{
									uuid: crypto.randomUUID(),
									shortcut: 11,
									type: "FOOD",
									name: "Beef Burger",
									price: 1400,
									category: undefined,
									variations: []
								},
								{
									uuid: crypto.randomUUID(),
									shortcut: 12,
									type: "FOOD",
									name: "Vegetarian Pasta",
									price: 1300,
									category: undefined,
									variations: []
								},
								{
									uuid: crypto.randomUUID(),
									shortcut: 13,
									type: "FOOD",
									name: "Fish & Chips",
									price: 1500,
									category: undefined,
									variations: []
								}
							]
						},
						{
							uuid: crypto.randomUUID(),
							name: "Beilage",
							maxSelections: 2,
							products: [
								{
									uuid: crypto.randomUUID(),
									shortcut: 20,
									type: "FOOD",
									name: "French Fries",
									price: 400,
									category: undefined,
									variations: []
								},
								{
									uuid: crypto.randomUUID(),
									shortcut: 21,
									type: "FOOD",
									name: "Mixed Salad",
									price: 450,
									category: undefined,
									variations: []
								},
								{
									uuid: crypto.randomUUID(),
									shortcut: 22,
									type: "FOOD",
									name: "Steamed Vegetables",
									price: 450,
									category: undefined,
									variations: []
								},
								{
									uuid: crypto.randomUUID(),
									shortcut: 23,
									type: "FOOD",
									name: "Rice",
									price: 350,
									category: undefined,
									variations: []
								}
							]
						},
						{
							uuid: crypto.randomUUID(),
							name: "Getränk",
							maxSelections: 4,
							products: [
								{
									uuid: crypto.randomUUID(),
									shortcut: 30,
									type: "DRINK",
									name: "Cola",
									price: 300,
									category: undefined,
									variations: []
								},
								{
									uuid: crypto.randomUUID(),
									shortcut: 31,
									type: "DRINK",
									name: "Fanta",
									price: 300,
									category: undefined,
									variations: []
								},
								{
									uuid: crypto.randomUUID(),
									shortcut: 32,
									type: "DRINK",
									name: "Sprite",
									price: 300,
									category: undefined,
									variations: []
								},
								{
									uuid: crypto.randomUUID(),
									shortcut: 33,
									type: "DRINK",
									name: "Water",
									price: 250,
									category: undefined,
									variations: []
								},
								{
									uuid: crypto.randomUUID(),
									shortcut: 34,
									type: "DRINK",
									name: "Orange Juice",
									price: 350,
									category: undefined,
									variations: []
								}
							]
						},
						{
							uuid: crypto.randomUUID(),
							name: "Dessert",
							maxSelections: 1,
							products: [
								{
									uuid: crypto.randomUUID(),
									shortcut: 40,
									type: "FOOD",
									name: "Tiramisu",
									price: 550,
									category: undefined,
									variations: []
								},
								{
									uuid: crypto.randomUUID(),
									shortcut: 41,
									type: "FOOD",
									name: "Ice Cream",
									price: 450,
									category: undefined,
									variations: []
								},
								{
									uuid: crypto.randomUUID(),
									shortcut: 42,
									type: "FOOD",
									name: "Chocolate Cake",
									price: 600,
									category: undefined,
									variations: []
								}
							]
						}
					]
				},
				{
					id: 2,
					uuid: crypto.randomUUID(),
					offerType: "DISCOUNT",
					discountType: "PERCENTAGE",
					offerValue: 20,
					startTime: "17:00",
					endTime: "19:00",
					weekdays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"],
					offerItems: [
						{
							uuid: crypto.randomUUID(),
							name: "Happy Hour Pizza",
							maxSelections: 1,
							products: [
								{
									uuid: crypto.randomUUID(),
									shortcut: 50,
									type: "FOOD",
									name: "Margherita Pizza",
									price: 1200,
									category: undefined,
									variations: []
								},
								{
									uuid: crypto.randomUUID(),
									shortcut: 51,
									type: "FOOD",
									name: "Pepperoni Pizza",
									price: 1400,
									category: undefined,
									variations: []
								},
								{
									uuid: crypto.randomUUID(),
									shortcut: 52,
									type: "FOOD",
									name: "Vegetarian Pizza",
									price: 1300,
									category: undefined,
									variations: []
								}
							]
						}
					]
				}
			]
		}
	}

	private loadRatingsData() {
		// TODO: Load ratings data from API or localStorage
		// For now, create sample data
		if (!this.restaurant) {
			return
		}

		this.restaurant.ratings = [
			{
				uuid: crypto.randomUUID(),
				username: "Anna M.",
				value: 5,
				review:
					"Ausgezeichnetes Essen und toller Service! Wir kommen gerne wieder.",
				userUuid: crypto.randomUUID()
			},
			{
				uuid: crypto.randomUUID(),
				username: "Michael K.",
				value: 4,
				review:
					"Sehr gutes Restaurant mit freundlichem Personal. Das Essen war lecker.",
				userUuid: crypto.randomUUID()
			},
			{
				uuid: crypto.randomUUID(),
				username: "Sarah L.",
				value: 5,
				review:
					"Fantastische Atmosphäre und hervorragende Qualität. Absolut empfehlenswert!",
				userUuid: crypto.randomUUID()
			},
			{
				uuid: crypto.randomUUID(),
				username: "Thomas B.",
				value: 4,
				review:
					"Gutes Preis-Leistungs-Verhältnis. Die Portionen waren großzügig.",
				userUuid: crypto.randomUUID()
			},
			{
				uuid: crypto.randomUUID(),
				username: "Julia S.",
				value: 3,
				review:
					"Das Essen war in Ordnung, aber der Service hätte besser sein können.",
				userUuid: crypto.randomUUID()
			},
			{
				uuid: crypto.randomUUID(),
				username: "Julia S.",
				value: 3,
				review:
					"Das Essen war in Ordnung, aber der Service hätte besser sein können.",
				userUuid: crypto.randomUUID()
			},
			{
				uuid: crypto.randomUUID(),
				username: "Julia S.",
				value: 3,
				review:
					"Das Essen war in Ordnung, aber der Service hätte besser sein können.",
				userUuid: crypto.randomUUID()
			},
			{
				uuid: crypto.randomUUID(),
				username: "Julia S.",
				value: 3,
				review:
					"Das Essen war in Ordnung, aber der Service hätte besser sein können.",
				userUuid: crypto.randomUUID()
			},
			{
				uuid: crypto.randomUUID(),
				username: "Julia S.",
				value: 3,
				review:
					"Das Essen war in Ordnung, aber der Service hätte besser sein können.Das Essen war in Ordnung, aber der Service hätte besser sein können.Das Essen war in Ordnung, aber der Service hätte besser sein können.Das Essen war in Ordnung, aber der Service hätte besser sein können.",
				userUuid: crypto.randomUUID()
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
		if (!this.restaurant?.ratings || this.restaurant.ratings.length === 0) {
			return 0
		}
		const sum = this.restaurant.ratings.reduce(
			(acc, rating) => acc + rating.value,
			0
		)
		return sum / this.restaurant.ratings.length
	}

	getVariationTooltip(variation: Variation): string {
		if (!variation.variationItems || variation.variationItems.length === 0) {
			return variation.name
		}

		const items = variation.variationItems
			.map(item => {
				const cost =
					item.additionalCost > 0
						? ` (+${formatPrice(item.additionalCost)})`
						: ""
				return `${item.name}${cost}`
			})
			.join(", ")

		return `${variation.name}: ${items}`
	}

	getProductVariationsText(product: Product): string {
		if (!product.variations || product.variations.length === 0) {
			return ""
		}
		return product.variations.map(v => v.name).join(", ")
	}

	addImage() {
		if (this.uploadImageDialog) {
			this.uploadImageDialog.open()
		}
	}

	onImageUploaded(imageUrl: string) {
		if (this.restaurant) {
			if (!this.restaurant.images) {
				this.restaurant.images = []
			}

			// Add the new image
			this.restaurant.images.push(imageUrl)

			// Set as current image
			this.currentImageIndex = this.restaurant.images.length - 1
			this.updateCurrentImage()
		}
	}
}
