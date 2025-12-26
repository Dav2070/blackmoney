import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditVariationItemDialogComponent } from './edit-variation-item-dialog.component';

describe('EditVariationItemDialogComponent', () => {
  let component: EditVariationItemDialogComponent;
  let fixture: ComponentFixture<EditVariationItemDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditVariationItemDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditVariationItemDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
