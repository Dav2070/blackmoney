import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import { SpecialsTableComponent } from './specials-table.component';
import { Menu, MenuItem, OfferType, Weekday } from 'src/app/models/Menu';
import { Product } from 'src/app/models/Product';

describe('SpecialsTableComponent', () => {
  let component: SpecialsTableComponent;
  let fixture: ComponentFixture<SpecialsTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SpecialsTableComponent],
      imports: [
        NoopAnimationsModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });

  it('should limit items to one per special', () => {
    const mockSpecial: Menu = {
      uuid: 'test-special',
      id: 1,
      name: 'Test Special',
      offerType: 'FIXED_PRICE' as OfferType,
      offerValue: 10,
      selectedProducts: [] as Product[],
      validity: {
        startDate: undefined,
        endDate: undefined,
        startTime: undefined,
        endTime: undefined,
        weekdays: [] as Weekday[]
      },
      items: [] as MenuItem[]
    };

    // Initially should be able to add item
    expect(component.canAddItem(mockSpecial)).toBe(true);

    // Add one item
    const mockItem: MenuItem = {
      uuid: 'test-item',
      name: 'Test Item',
      categories: [],
      products: [],
      maxSelections: 1
    };
    mockSpecial.items.push(mockItem);

    // Should not be able to add another item
    expect(component.canAddItem(mockSpecial)).toBe(false);
  });
});
