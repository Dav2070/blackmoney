import { ComponentFixture, TestBed } from "@angular/core/testing"

import { TableCombinationComponent } from "./table-combination.component"

describe("TableCombinationComponent", () => {
	let component: TableCombinationComponent
	let fixture: ComponentFixture<TableCombinationComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TableCombinationComponent]
		}).compileComponents()

		fixture = TestBed.createComponent(TableCombinationComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it("should create", () => {
		expect(component).toBeTruthy()
	})
})
