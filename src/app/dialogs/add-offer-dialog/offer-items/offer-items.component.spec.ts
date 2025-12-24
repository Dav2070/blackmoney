import { ComponentFixture, TestBed } from "@angular/core/testing"
import { OfferItemsComponent } from "./offer-items.component"

describe("OfferItemsComponent", () => {
	let component: OfferItemsComponent
	let fixture: ComponentFixture<OfferItemsComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [OfferItemsComponent]
		}).compileComponents()

		fixture = TestBed.createComponent(OfferItemsComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it("should create", () => {
		expect(component).toBeTruthy()
	})
})
