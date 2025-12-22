import { ComponentFixture, TestBed } from "@angular/core/testing"
import { OfferBasicDataComponent } from "./offer-basic-data.component"

describe("OfferBasicDataComponent", () => {
	let component: OfferBasicDataComponent
	let fixture: ComponentFixture<OfferBasicDataComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [OfferBasicDataComponent]
		}).compileComponents()

		fixture = TestBed.createComponent(OfferBasicDataComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it("should create", () => {
		expect(component).toBeTruthy()
	})
})
