import { ComponentFixture, TestBed } from "@angular/core/testing"

import { SeparatePayPageComponent } from "./separate-pay-page.component"

describe("SeparatePayPageComponent", () => {
	let component: SeparatePayPageComponent
	let fixture: ComponentFixture<SeparatePayPageComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [SeparatePayPageComponent]
		}).compileComponents()

		fixture = TestBed.createComponent(SeparatePayPageComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it("should create", () => {
		expect(component).toBeTruthy()
	})
})
