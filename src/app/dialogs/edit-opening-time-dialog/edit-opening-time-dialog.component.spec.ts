import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOpeningTimeDialogComponent } from './edit-opening-time-dialog.component';

describe('EditOpeningTimeDialogComponent', () => {
  let component: EditOpeningTimeDialogComponent;
  let fixture: ComponentFixture<EditOpeningTimeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditOpeningTimeDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditOpeningTimeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
