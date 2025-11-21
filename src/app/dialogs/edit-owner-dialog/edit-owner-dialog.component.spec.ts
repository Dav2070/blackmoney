import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOwnerDialogComponent } from './edit-owner-dialog.component';

describe('EditOwnerDialogComponent', () => {
  let component: EditOwnerDialogComponent;
  let fixture: ComponentFixture<EditOwnerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditOwnerDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditOwnerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
