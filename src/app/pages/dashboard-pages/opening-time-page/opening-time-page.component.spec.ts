import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpeningTimePageComponent } from './opening-time-page.component';

describe('OpeningTimePageComponent', () => {
  let component: OpeningTimePageComponent;
  let fixture: ComponentFixture<OpeningTimePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpeningTimePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpeningTimePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
