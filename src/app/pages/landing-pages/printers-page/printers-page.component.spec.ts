import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintersPageComponent } from './printers-page.component';

describe('PrintersPageComponent', () => {
  let component: PrintersPageComponent;
  let fixture: ComponentFixture<PrintersPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintersPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
