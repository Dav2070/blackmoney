import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpeningDaysComponent } from './opening-days.component';

describe('OpeningDaysComponent', () => {
  let component: OpeningDaysComponent;
  let fixture: ComponentFixture<OpeningDaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpeningDaysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpeningDaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
