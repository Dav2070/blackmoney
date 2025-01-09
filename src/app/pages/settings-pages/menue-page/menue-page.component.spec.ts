import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuePageComponent } from './menue-page.component';

describe('MenuePageComponent', () => {
  let component: MenuePageComponent;
  let fixture: ComponentFixture<MenuePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuePageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MenuePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
