import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServicesLabComponent } from './services-lab.component';

describe('ServicesLabComponent', () => {
  let component: ServicesLabComponent;
  let fixture: ComponentFixture<ServicesLabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesLabComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ServicesLabComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
