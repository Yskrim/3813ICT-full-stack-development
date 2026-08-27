import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render greeting from signal', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Hello, Allan!');
  });

  it('should update count with increment', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.increment();
    await fixture.whenStable();
    expect(app.count()).toBe(1);
    expect(app.doubled()).toBe(2);
  });
});
