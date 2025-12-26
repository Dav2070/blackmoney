import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVariationItemDialogComponent } from './add-variation-item-dialog.component';

describe('AddVariationItemDialogComponent', () => {
  let component: AddVariationItemDialogComponent;
  let fixture: ComponentFixture<AddVariationItemDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddVariationItemDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddVariationItemDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
