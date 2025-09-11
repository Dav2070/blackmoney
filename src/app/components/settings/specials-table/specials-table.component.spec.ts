import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing"
import { NoopAnimationsModule } from "@angular/platform-browser/animations"
import { MatPaginatorModule } from "@angular/material/paginator"
import { MatSortModule } from "@angular/material/sort"
import { MatTableModule } from "@angular/material/table"
import { SpecialsTableComponent } from "./specials-table.component"
import { Offer } from "src/app/models/Offer"
import { OfferItem } from "src/app/models/OfferItem"
import { Weekday, OfferType } from "src/app/types"

describe("SpecialsTableComponent", () => {
	let component: SpecialsTableComponent
	let fixture: ComponentFixture<SpecialsTableComponent>

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [SpecialsTableComponent],
			imports: [
				NoopAnimationsModule,
				MatPaginatorModule,
				MatSortModule,
				MatTableModule
			]
		}).compileComponents()
	}))

	beforeEach(() => {
		fixture = TestBed.createComponent(SpecialsTableComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it("should compile", () => {
		expect(component).toBeTruthy()
	})

	it("should limit items to one per special", () => {
		const mockSpecial: Offer = {
			uuid: "test-special",
			name: "Test Special",
			offerType: "FIXED_PRICE" as OfferType,
			offerValue: 10,
			startDate: undefined,
			endDate: undefined,
			startTime: undefined,
			endTime: undefined,
			weekdays: [] as Weekday[],
			offerItems: [] as OfferItem[]
		}

		// Initially should be able to add item
		expect(component.canAddItem(mockSpecial)).toBe(true)

		// Add one item
		const mockItem: OfferItem = {
			uuid: "test-item",
			name: "Test Item",
			products: [],
			maxSelections: 1
		}
		mockSpecial.offerItems.push(mockItem)

		// Should not be able to add another item
		expect(component.canAddItem(mockSpecial)).toBe(false)
	})
})
