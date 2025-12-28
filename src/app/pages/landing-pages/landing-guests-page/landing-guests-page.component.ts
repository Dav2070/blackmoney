import { Component, EventEmitter, Output, OnInit } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { faStar, faCupTogo, faTruck } from "@fortawesome/pro-regular-svg-icons"

@Component({
	templateUrl: "./landing-guests-page.component.html",
	styleUrl: "./landing-guests-page.component.scss",
	standalone: false
})
export class LandingGuestsPageComponent implements OnInit {
	constructor(
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

	// sample data for cards
	restaurants: {
		uuid: string
		name: string
		addressLine1: string
		postalCode: string
		city: string
		rating: number
		imageUrl: string | null
		hasTakeaway: boolean
		hasDelivery: boolean
	}[] = [
		{
			uuid: crypto.randomUUID(),
			name: "Café Central",
			addressLine1: "Hauptstraße 1",
			postalCode: "10115",
			city: "Berlin",
			rating: 4,
			imageUrl: null,
			hasTakeaway: true,
			hasDelivery: false
		},
		{
			uuid: crypto.randomUUID(),
			name: "Pizzeria Roma",
			addressLine1: "Italienerweg 5",
			postalCode: "80331",
			city: "München",
			rating: 5,
			imageUrl: null,
			hasTakeaway: true,
			hasDelivery: true
		},
		{
			uuid: crypto.randomUUID(),
			name: "Sushi House",
			addressLine1: "Fischmarkt 12",
			postalCode: "20095",
			city: "Hamburg",
			rating: 3,
			imageUrl: null,
			hasTakeaway: false,
			hasDelivery: true
		},
		{
			uuid: crypto.randomUUID(),
			name: "Bistro Grün",
			addressLine1: "Parkallee 7",
			postalCode: "04109",
			city: "Leipzig",
			rating: 2,
			imageUrl: null,
			hasTakeaway: false,
			hasDelivery: false
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
					r.city
						.toLowerCase()
						.includes(this.cityPostalFilter.toLowerCase()) ||
					r.postalCode.includes(this.cityPostalFilter)
				)
			)
				return false
			if (this.ratingFilter && r.rating < this.ratingFilter) return false
			if (this.hasTakeaway && !r.hasTakeaway) return false
			if (this.hasDelivery && !r.hasDelivery) return false
			return true
		})
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
