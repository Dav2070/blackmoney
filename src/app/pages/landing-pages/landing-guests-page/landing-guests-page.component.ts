import { Component, EventEmitter, Output, OnInit } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { faStar, faCupTogo, faTruck } from "@fortawesome/pro-regular-svg-icons"
import { Restaurant } from "src/app/models/Restaurant"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	templateUrl: "./landing-guests-page.component.html",
	styleUrl: "./landing-guests-page.component.scss",
	standalone: false
})
export class LandingGuestsPageComponent implements OnInit {
	constructor(
		private localizationService: LocalizationService,
		private router: Router,
		private route: ActivatedRoute
	) {}

	ngOnInit() {
		// Read filter values from query params
		this.route.queryParams.subscribe(params => {
			this.nameFilter = params["name"] || ""
			this.cityPostalFilter = params["cityPostal"] || ""
			this.distanceKm = params["distanceKm"]
				? Number(params["distanceKm"])
				: 10
			this.ratingFilter = params["rating"] ? Number(params["rating"]) : 0
			this.hasTakeaway = params["hasTakeaway"] === "true"
			this.hasDelivery = params["hasDelivery"] === "true"

			// Trigger filter update
			this.scheduleEmitFilters()
		})
	}
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

	locale = this.localizationService.locale.landingGuestsPage

	// sample data for cards
	restaurants: Restaurant[] = [
		{
			uuid: crypto.randomUUID(),
			name: "Wupper Grill",
			address: {
				uuid: crypto.randomUUID(),
				addressLine1: "Musterstraße 1",
				postalCode: "10115",
				city: "Berlin",
				country: "Germany"
			},
			ratings: [
				{
					uuid: crypto.randomUUID(),
					username: "Jacek",
					value: 5,
					review: "War super lecker und der Service war freundlich!",
					userUuid: crypto.randomUUID()
				}
			],
			images: [
				"https://dynamic-media-cdn.tripadvisor.com/media/photo-o/07/0a/aa/4d/wupper-grill.jpg?w=1200&h=1200&s=1",
				"https://img.restaurantguru.com/r271-image-Can-2-Doner-and-Pizzeria-2021-09-985088.jpg",
				"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMYz7f3RzYA7HQjJQAB1M47MUJOA4HzUn0SQ&s"
			],
			hasTakeaway: true,
			hasDelivery: true,
			menu: {
				uuid: crypto.randomUUID(),
				variations: [],
				categories: [
					{
						uuid: crypto.randomUUID(),
						name: "Vorspeisen",
						products: [
							{
								uuid: crypto.randomUUID(),
								shortcut: 1,
								type: "FOOD",
								name: "Caesar Salad",
								price: 850,
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
								name: "Tomato Soup",
								price: 600,
								variations: []
							}
						]
					},
					{
						uuid: crypto.randomUUID(),
						name: "Hauptgerichte",
						products: [
							{
								uuid: crypto.randomUUID(),
								shortcut: 3,
								type: "FOOD",
								name: "Grilled Salmon",
								price: 1800,
								variations: []
							},
							{
								uuid: crypto.randomUUID(),
								shortcut: 4,
								type: "FOOD",
								name: "Beef Steak",
								price: 2200,
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
							}
						]
					}
				],
				offers: [
					{
						id: 1,
						uuid: crypto.randomUUID(),
						offerType: "DISCOUNT",
						discountType: "PERCENTAGE",
						offerValue: 10,
						startDate: undefined,
						endDate: undefined,
						startTime: undefined,
						endTime: undefined,
						weekdays: ["MONDAY", "TUESDAY"],
						offerItems: [
							{
								uuid: crypto.randomUUID(),
								name: "Mittagsangebot",
								maxSelections: 1,
								products: []
							}
						]
					}
				]
			},
			phoneNumber: "030 1234567",
			mail: "Jacek@yandex.ru",
			users: [],
			rooms: [],
			registers: [],
			printers: []
		},
		{
			uuid: crypto.randomUUID(),
			name: "Pizzeria Roma",
			address: {
				uuid: crypto.randomUUID(),
				addressLine1: "Italienerweg 5",
				postalCode: "80331",
				city: "München",
				country: "Germany"
			},
			ratings: [
				{
					uuid: crypto.randomUUID(),
					username: "Marek",
					value: 5,
					review: "Leckere Pizza und schnelle Lieferung!",
					userUuid: crypto.randomUUID()
				}
			],
			images: [
				"https://via.placeholder.com/400x300/CCCCCC/FFFFFF?text=Pizzeria+Roma"
			],
			hasTakeaway: false,
			hasDelivery: false,
			menu: undefined,
			users: [],
			rooms: [],
			registers: [],
			printers: []
		},
		{
			uuid: crypto.randomUUID(),
			name: "Sushi House",
			address: {
				uuid: crypto.randomUUID(),
				addressLine1: "Fischmarkt 12",
				postalCode: "20095",
				city: "Hamburg",
				country: "Germany"
			},
			ratings: [
				{
					uuid: crypto.randomUUID(),
					username: "Lelek",
					value: 3,
					review: "Frisches Sushi, aber etwas teuer.",
					userUuid: crypto.randomUUID()
				}
			],
			images: [
				"https://via.placeholder.com/400x300/CCCCCC/FFFFFF?text=Sushi+House"
			],
			hasTakeaway: false,
			hasDelivery: true,
			menu: undefined,
			users: [],
			rooms: [],
			registers: [],
			printers: []
		},
		{
			uuid: crypto.randomUUID(),
			name: "Bistro Grün",
			address: {
				uuid: crypto.randomUUID(),
				addressLine1: "Parkallee 7",
				postalCode: "04109",
				city: "Leipzig",
				country: "Germany"
			},
			ratings: [
				{
					uuid: crypto.randomUUID(),
					username: "Niggo",
					value: 2,
					review: "Nettes Bistro, aber wenig Auswahl.",
					userUuid: crypto.randomUUID()
				}
			],
			images: [
				"https://via.placeholder.com/400x300/CCCCCC/FFFFFF?text=Bistro+Gr%C3%BCn"
			],
			hasTakeaway: false,
			hasDelivery: true,
			menu: undefined,
			users: [],
			rooms: [],
			registers: [],
			printers: []
		}
	]

	@Output() filtersChanged = new EventEmitter<{
		name: string
		cityPostal: string
		distanceKm: number
		rating: number
		hasTakeaway: boolean
		hasDelivery: boolean
	}>()

	private emitTimer: any = null

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

	get filteredRestaurants() {
		return this.restaurants.filter(r => {
			if (
				this.nameFilter &&
				!r.name.toLowerCase().includes(this.nameFilter.toLowerCase())
			)
				return false
			if (
				this.cityPostalFilter &&
				!(
					r.address.city
						.toLowerCase()
						.includes(this.cityPostalFilter.toLowerCase()) ||
					r.address.postalCode.includes(this.cityPostalFilter)
				)
			)
				return false
			if (this.ratingFilter && this.getAverageRating(r) < this.ratingFilter)
				return false
			if (this.hasTakeaway && !r.hasTakeaway) return false
			if (this.hasDelivery && !r.hasDelivery) return false
			return true
		})
	}

	getAverageRating(restaurant: Restaurant): number {
		if (!restaurant.ratings || restaurant.ratings.length === 0) {
			return 0
		}
		const sum = restaurant.ratings.reduce(
			(acc, rating) => acc + rating.value,
			0
		)
		return sum / restaurant.ratings.length
	}

	trackByUuid(index: number, item: { uuid: string }) {
		return item.uuid
	}

	openRestaurant(event: MouseEvent, uuid: string) {
		event.preventDefault()

		// Find the restaurant data and store it for the detail page
		const restaurant = this.restaurants.find(r => r.uuid === uuid)
		if (restaurant) {
			localStorage.setItem("selectedRestaurant", JSON.stringify(restaurant))
		}

		this.router.navigate(["guests", "restaurantinfo", uuid])
	}
}
