import { ComponentFixture, TestBed } from "@angular/core/testing"
import { EditOfferDialogComponent } from "./edit-offer-dialog.component"

describe("EditOfferDialogComponent", () => {
	let component: EditOfferDialogComponent
	let fixture: ComponentFixture<EditOfferDialogComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [EditOfferDialogComponent]
		}).compileComponents()

		fixture = TestBed.createComponent(EditOfferDialogComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it("should create", () => {
		expect(component).toBeTruthy()
	})
})
