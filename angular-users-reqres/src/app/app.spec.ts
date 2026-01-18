import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { LoadingService } from './core/services/loading.service';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;

  beforeEach(async () => {
    const loadingServiceSpy = jasmine.createSpyObj('LoadingService', [], {
      isLoading: jasmine.createSpy().and.returnValue(false),
      activeRequestsCount: jasmine.createSpy().and.returnValue(0),
    });

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: LoadingService, useValue: loadingServiceSpy },
        provideRouter([]),
        provideAnimations(),
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    mockLoadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject LoadingService', () => {
    expect(component.loadingService).toBeTruthy();
  });

  it('should render router-outlet', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should render header component', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('app-header')).toBeTruthy();
  });
});
