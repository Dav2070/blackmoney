import { ComponentFixture, TestBed } from "@angular/core/testing"

import { TableCombinationsPageComponent } from "./table-combinations-page.component"

describe("TableCombinationsPageComponent", () => {
	let component: TableCombinationsPageComponent
	let fixture: ComponentFixture<TableCombinationsPageComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TableCombinationsPageComponent]
		}).compileComponents()

		fixture = TestBed.createComponent(TableCombinationsPageComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it("should create", () => {
		expect(component).toBeTruthy()
	})
})
