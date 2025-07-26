import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing"
import { NoopAnimationsModule } from "@angular/platform-browser/animations"
import { MatPaginatorModule } from "@angular/material/paginator"
import { MatSortModule } from "@angular/material/sort"
import { MatTableModule } from "@angular/material/table"

import { VariationsTableComponent } from "./variations-table.component"

describe("VariationsTableComponent", () => {
	let component: VariationsTableComponent
	let fixture: ComponentFixture<VariationsTableComponent>

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [VariationsTableComponent],
			imports: [
				NoopAnimationsModule,
				MatPaginatorModule,
				MatSortModule,
				MatTableModule
			]
		}).compileComponents()
	}))

	beforeEach(() => {
		fixture = TestBed.createComponent(VariationsTableComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it("should compile", () => {
		expect(component).toBeTruthy()
	})
})
