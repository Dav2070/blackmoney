import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditVariationDialogComponent } from './edit-variation-dialog.component';

describe('EditVariationDialogComponent', () => {
  let component: EditVariationDialogComponent;
  let fixture: ComponentFixture<EditVariationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditVariationDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditVariationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
