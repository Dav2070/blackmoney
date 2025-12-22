import { ComponentFixture, TestBed } from "@angular/core/testing"
import { OfferAvailabilityComponent } from "./offer-availability.component"

describe("OfferAvailabilityComponent", () => {
	let component: OfferAvailabilityComponent
	let fixture: ComponentFixture<OfferAvailabilityComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [OfferAvailabilityComponent]
		}).compileComponents()

		fixture = TestBed.createComponent(OfferAvailabilityComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it("should create", () => {
		expect(component).toBeTruthy()
	})
})
