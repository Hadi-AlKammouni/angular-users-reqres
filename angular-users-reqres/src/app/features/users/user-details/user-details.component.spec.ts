import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { UserDetailsComponent } from './user-details.component';
import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models/user.model';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('UserDetailsComponent', () => {
  let component: UserDetailsComponent;
  let fixture: ComponentFixture<UserDetailsComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    avatar: 'https://example.com/avatar.jpg',
  };

  const mockUserResponse = { data: mockUser };

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('ApiService', ['getUserById']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      params: of({ id: '1' }),
    };

    await TestBed.configureTestingModule({
      imports: [UserDetailsComponent],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load user from route params', () => {
      mockApiService.getUserById.and.returnValue(of(mockUserResponse));

      component.ngOnInit();

      expect(component.userId()).toBe(1);
      expect(mockApiService.getUserById).toHaveBeenCalledWith(1);
      expect(component.user()).toEqual(mockUser);
    });

    it('should handle route params with different user IDs', () => {
      const userId = 5;
      mockActivatedRoute.params = of({ id: userId.toString() });
      mockApiService.getUserById.and.returnValue(of(mockUserResponse));

      component.ngOnInit();

      expect(component.userId()).toBe(userId);
      expect(mockApiService.getUserById).toHaveBeenCalledWith(userId);
    });

    it('should not load user if no ID in params', () => {
      mockActivatedRoute.params = of({});

      component.ngOnInit();

      expect(mockApiService.getUserById).not.toHaveBeenCalled();
      expect(component.userId()).toBeNull();
    });

    it('should handle invalid user ID', () => {
      mockActivatedRoute.params = of({ id: 'invalid' });

      component.ngOnInit();

      // NaN is falsy, so it won't trigger loadUser
      expect(mockApiService.getUserById).not.toHaveBeenCalled();
    });
  });

  describe('loadUser', () => {
    it('should load user details by ID', () => {
      mockApiService.getUserById.and.returnValue(of(mockUserResponse));

      component.loadUser(1);

      expect(mockApiService.getUserById).toHaveBeenCalledWith(1);
      expect(component.user()).toEqual(mockUser);
      expect(component.isLoading()).toBe(false);
      expect(component.error()).toBeNull();
    });

    it('should set loading state while fetching', () => {
      mockApiService.getUserById.and.returnValue(of(mockUserResponse));

      component.loadUser(1);

      expect(component.isLoading()).toBe(false); // False after completion
    });

    it('should handle API errors', () => {
      const errorMessage = 'Failed to load user details. Please try again.';
      mockApiService.getUserById.and.returnValue(throwError(() => new Error('Network error')));

      component.loadUser(1);

      expect(component.error()).toBe(errorMessage);
      expect(component.isLoading()).toBe(false);
      expect(component.user()).toBeNull();
    });

    it('should clear previous errors on new load', () => {
      // First request fails
      mockApiService.getUserById.and.returnValue(throwError(() => new Error('Network error')));
      component.loadUser(1);
      expect(component.error()).not.toBeNull();

      // Second request succeeds
      mockApiService.getUserById.and.returnValue(of(mockUserResponse));
      component.loadUser(1);

      expect(component.error()).toBeNull();
    });

    it('should load different users correctly', () => {
      const user2: User = {
        id: 2,
        email: 'jane@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        avatar: 'https://example.com/avatar2.jpg',
      };
      const user2Response = { data: user2 };

      mockApiService.getUserById.and.returnValue(of(user2Response));

      component.loadUser(2);

      expect(mockApiService.getUserById).toHaveBeenCalledWith(2);
      expect(component.user()).toEqual(user2);
    });
  });

  describe('goBack', () => {
    it('should navigate to users list', () => {
      component.goBack();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/users']);
    });
  });

  describe('retryLoadUser', () => {
    it('should retry loading the current user', () => {
      component.userId.set(5);
      mockApiService.getUserById.and.returnValue(of(mockUserResponse));

      component.retryLoadUser();

      expect(mockApiService.getUserById).toHaveBeenCalledWith(5);
    });

    it('should not call API if userId is null', () => {
      component.userId.set(null);

      component.retryLoadUser();

      expect(mockApiService.getUserById).not.toHaveBeenCalled();
    });
  });

  describe('getFullName', () => {
    it('should return full name when user is loaded', () => {
      component.user.set(mockUser);

      const fullName = component.getFullName();

      expect(fullName).toBe('John Doe');
    });

    it('should return empty string when user is null', () => {
      component.user.set(null);

      const fullName = component.getFullName();

      expect(fullName).toBe('');
    });

    it('should handle different user names', () => {
      const user: User = {
        id: 2,
        email: 'jane@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        avatar: 'https://example.com/avatar2.jpg',
      };
      component.user.set(user);

      const fullName = component.getFullName();

      expect(fullName).toBe('Jane Smith');
    });
  });

  describe('openAvatarFullSize', () => {
    it('should open avatar in new tab', () => {
      spyOn(window, 'open');
      component.user.set(mockUser);

      component.openAvatarFullSize();

      expect(window.open).toHaveBeenCalledWith(mockUser.avatar, '_blank');
    });

    it('should not open window if user is null', () => {
      spyOn(window, 'open');
      component.user.set(null);

      component.openAvatarFullSize();

      expect(window.open).not.toHaveBeenCalled();
    });

    it('should not open window if avatar is empty', () => {
      spyOn(window, 'open');
      const userWithoutAvatar = { ...mockUser, avatar: '' };
      component.user.set(userWithoutAvatar);

      component.openAvatarFullSize();

      expect(window.open).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should display error message when API fails', () => {
      mockApiService.getUserById.and.returnValue(throwError(() => new Error('Server error')));

      component.loadUser(1);

      expect(component.error()).toBe('Failed to load user details. Please try again.');
      expect(component.isLoading()).toBe(false);
    });

    it('should allow retry after error', () => {
      component.userId.set(1);

      // First request fails
      mockApiService.getUserById.and.returnValue(throwError(() => new Error('Network error')));
      component.loadUser(1);
      expect(component.error()).not.toBeNull();

      // Retry succeeds
      mockApiService.getUserById.and.returnValue(of(mockUserResponse));
      component.retryLoadUser();

      expect(component.error()).toBeNull();
      expect(component.user()).toEqual(mockUser);
    });
  });

  describe('route parameter changes', () => {
    it('should reload user when route params change', () => {
      const paramsSubject = new BehaviorSubject({ id: '1' });
      mockActivatedRoute.params = paramsSubject.asObservable();
      mockApiService.getUserById.and.returnValue(of(mockUserResponse));

      component.ngOnInit();

      expect(mockApiService.getUserById).toHaveBeenCalledWith(1);

      // Change route params
      const user2Response = {
        data: { ...mockUser, id: 2, first_name: 'Jane' },
      };
      mockApiService.getUserById.and.returnValue(of(user2Response));
      paramsSubject.next({ id: '2' });

      expect(mockApiService.getUserById).toHaveBeenCalledWith(2);
    });
  });

  describe('template integration', () => {
    it('should render user details when loaded', () => {
      mockApiService.getUserById.and.returnValue(of(mockUserResponse));

      component.ngOnInit();
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('mat-card')).toBeTruthy();
    });

    it('should not display error when there is no error', () => {
      mockApiService.getUserById.and.returnValue(of(mockUserResponse));

      component.loadUser(1);
      fixture.detectChanges();

      expect(component.error()).toBeNull();
    });
  });
});
