import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariationsOverviewPageComponent } from './variations-page.component';

describe('VariationsOverviewPageComponent', () => {
  let component: VariationsOverviewPageComponent;
  let fixture: ComponentFixture<VariationsOverviewPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariationsOverviewPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VariationsOverviewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
