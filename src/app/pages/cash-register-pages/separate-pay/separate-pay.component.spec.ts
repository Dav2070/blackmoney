import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeparatePayComponent } from './separate-pay.component';

describe('SeparatePayComponent', () => {
  let component: SeparatePayComponent;
  let fixture: ComponentFixture<SeparatePayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeparatePayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SeparatePayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
