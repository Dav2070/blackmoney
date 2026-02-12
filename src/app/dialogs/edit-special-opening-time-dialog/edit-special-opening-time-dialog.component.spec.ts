import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSpecialOpeningTimeDialogComponent } from './edit-special-opening-time-dialog.component';

describe('EditSpecialOpeningTimeDialogComponent', () => {
  let component: EditSpecialOpeningTimeDialogComponent;
  let fixture: ComponentFixture<EditSpecialOpeningTimeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSpecialOpeningTimeDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditSpecialOpeningTimeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
