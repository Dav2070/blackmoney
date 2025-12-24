import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVariationDialogComponent } from './add-variation-dialog.component';

describe('AddVariationDialogComponent', () => {
  let component: AddVariationDialogComponent;
  let fixture: ComponentFixture<AddVariationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddVariationDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddVariationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
