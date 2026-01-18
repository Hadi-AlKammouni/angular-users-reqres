import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HeaderComponent } from './header.component';
import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models/user.model';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockRouter: jasmine.SpyObj<Router>;

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

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: Router, useValue: mockRouter },
        provideAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have empty search input', () => {
      expect(component.searchInput()).toBe('');
    });

    it('should not be searching', () => {
      expect(component.isSearching()).toBe(false);
    });

    it('should have no search error', () => {
      expect(component.searchError()).toBeNull();
    });

    it('should have no found user', () => {
      expect(component.foundUser()).toBeNull();
    });

    it('should not be focused', () => {
      expect(component.isFocused()).toBe(false);
    });
  });

  describe('onSearchInputChange', () => {
    it('should update search input signal', () => {
      component.onSearchInputChange('123');

      expect(component.searchInput()).toBe('123');
    });

    it('should clear error and found user on new input', () => {
      component.searchError.set('Previous error');
      component.foundUser.set(mockUser);

      component.onSearchInputChange('456');

      expect(component.searchError()).toBeNull();
      expect(component.foundUser()).toBeNull();
    });

    it('should not search for empty input', () => {
      component.onSearchInputChange('');

      expect(component.isSearching()).toBe(false);
      expect(mockApiService.getUserById).not.toHaveBeenCalled();
    });

    it('should not search for whitespace-only input', () => {
      component.onSearchInputChange('   ');

      expect(component.isSearching()).toBe(false);
      expect(mockApiService.getUserById).not.toHaveBeenCalled();
    });

    it('should show error for non-numeric input', () => {
      component.onSearchInputChange('abc');

      expect(component.searchError()).toBe('Please enter a numeric user ID');
      expect(component.isSearching()).toBe(false);
      expect(mockApiService.getUserById).not.toHaveBeenCalled();
    });

    it('should show error for alphanumeric input', () => {
      component.onSearchInputChange('12abc34');

      expect(component.searchError()).toBe('Please enter a numeric user ID');
      expect(component.isSearching()).toBe(false);
    });

    it('should accept valid numeric input', () => {
      component.onSearchInputChange('123');

      expect(component.searchError()).toBeNull();
      expect(component.isSearching()).toBe(true);
    });

    it('should trim whitespace from input', () => {
      component.onSearchInputChange('  123  ');

      expect(component.isSearching()).toBe(true);
    });

    it('should debounce search by 400ms', fakeAsync(() => {
      mockApiService.getUserById.and.returnValue(of(mockUserResponse));

      component.onSearchInputChange('1');

      // Should not call API immediately
      expect(mockApiService.getUserById).not.toHaveBeenCalled();

      // Wait for debounce
      tick(400);

      expect(mockApiService.getUserById).toHaveBeenCalledWith(1);
    }));

    it('should cancel previous search if input changes', fakeAsync(() => {
      mockApiService.getUserById.and.returnValue(of(mockUserResponse));

      component.onSearchInputChange('1');
      tick(200);

      component.onSearchInputChange('2');
      tick(400);

      // Only the last search should execute
      expect(mockApiService.getUserById).toHaveBeenCalledWith(2);
      expect(mockApiService.getUserById).toHaveBeenCalledTimes(1);
    }));
  });

  describe('performSearch', () => {
    it('should search for user by ID', fakeAsync(() => {
      mockApiService.getUserById.and.returnValue(of(mockUserResponse));

      component.onSearchInputChange('1');
      tick(400);

      expect(mockApiService.getUserById).toHaveBeenCalledWith(1);
      expect(component.foundUser()).toEqual(mockUser);
      expect(component.isSearching()).toBe(false);
    }));

    it('should handle user not found error', fakeAsync(() => {
      mockApiService.getUserById.and.returnValue(throwError(() => new Error('Not found')));

      component.onSearchInputChange('999');
      tick(400);

      expect(component.searchError()).toBe('User not found. Please verify the ID and try again.');
      expect(component.foundUser()).toBeNull();
      expect(component.isSearching()).toBe(false);
    }));

    it('should not search if input is empty after debounce', fakeAsync(() => {
      component.onSearchInputChange('123');
      component.onSearchInputChange('');
      tick(400);

      expect(mockApiService.getUserById).not.toHaveBeenCalled();
    }));

    it('should search for different user IDs', fakeAsync(() => {
      mockApiService.getUserById.and.returnValue(of(mockUserResponse));

      component.onSearchInputChange('1');
      tick(400);
      expect(mockApiService.getUserById).toHaveBeenCalledWith(1);

      component.onSearchInputChange('5');
      tick(400);
      expect(mockApiService.getUserById).toHaveBeenCalledWith(5);
    }));
  });

  describe('navigateToUser', () => {
    it('should navigate to found user details', () => {
      component.foundUser.set(mockUser);

      component.navigateToUser();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/user', mockUser.id]);
    });

    it('should clear search after navigation', () => {
      component.foundUser.set(mockUser);
      component.searchInput.set('1');
      component.searchError.set('Some error');

      component.navigateToUser();

      expect(component.searchInput()).toBe('');
      expect(component.searchError()).toBeNull();
      expect(component.foundUser()).toBeNull();
    });

    it('should not navigate if no user is found', () => {
      component.foundUser.set(null);

      component.navigateToUser();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('clearSearch', () => {
    it('should clear all search state', () => {
      component.searchInput.set('123');
      component.searchError.set('Some error');
      component.isSearching.set(true);
      component.foundUser.set(mockUser);

      component.clearSearch();

      expect(component.searchInput()).toBe('');
      expect(component.searchError()).toBeNull();
      expect(component.isSearching()).toBe(false);
      expect(component.foundUser()).toBeNull();
    });
  });

  describe('onFocus', () => {
    it('should set focused state to true', () => {
      component.onFocus();

      expect(component.isFocused()).toBe(true);
    });
  });

  describe('onBlur', () => {
    it('should set focused state to false', () => {
      component.isFocused.set(true);

      component.onBlur();

      expect(component.isFocused()).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete search flow', fakeAsync(() => {
      mockApiService.getUserById.and.returnValue(of(mockUserResponse));

      // User types a valid ID
      component.onSearchInputChange('1');
      expect(component.isSearching()).toBe(true);

      // Wait for debounce
      tick(400);

      // User is found
      expect(component.foundUser()).toEqual(mockUser);
      expect(component.isSearching()).toBe(false);

      // User navigates to details
      component.navigateToUser();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/user', 1]);

      // Search is cleared
      expect(component.searchInput()).toBe('');
    }));

    it('should handle error and retry flow', fakeAsync(() => {
      // First attempt fails
      mockApiService.getUserById.and.returnValue(throwError(() => new Error('Not found')));

      component.onSearchInputChange('999');
      tick(400);

      expect(component.searchError()).not.toBeNull();
      expect(component.foundUser()).toBeNull();

      // Second attempt succeeds
      mockApiService.getUserById.and.returnValue(of(mockUserResponse));

      component.onSearchInputChange('1');
      tick(400);

      expect(component.searchError()).toBeNull();
      expect(component.foundUser()).toEqual(mockUser);
    }));

    it('should handle rapid typing', fakeAsync(() => {
      mockApiService.getUserById.and.returnValue(of(mockUserResponse));

      component.onSearchInputChange('1');
      tick(100);
      component.onSearchInputChange('12');
      tick(100);
      component.onSearchInputChange('123');
      tick(400);

      // Only the last search should execute
      expect(mockApiService.getUserById).toHaveBeenCalledWith(123);
      expect(mockApiService.getUserById).toHaveBeenCalledTimes(1);
    }));

    it('should handle clearing input during search', fakeAsync(() => {
      mockApiService.getUserById.and.returnValue(of(mockUserResponse));

      component.onSearchInputChange('123');
      tick(200);

      component.onSearchInputChange('');
      tick(400);

      expect(mockApiService.getUserById).not.toHaveBeenCalled();
      expect(component.isSearching()).toBe(false);
    }));
  });

  describe('validation', () => {
    it('should reject special characters', () => {
      component.onSearchInputChange('12@34');

      expect(component.searchError()).toBe('Please enter a numeric user ID');
    });

    it('should reject negative numbers', () => {
      component.onSearchInputChange('-123');

      expect(component.searchError()).toBe('Please enter a numeric user ID');
    });

    it('should accept zero', () => {
      component.onSearchInputChange('0');

      expect(component.searchError()).toBeNull();
      expect(component.isSearching()).toBe(true);
    });

    it('should accept large numbers', () => {
      component.onSearchInputChange('999999');

      expect(component.searchError()).toBeNull();
      expect(component.isSearching()).toBe(true);
    });
  });
});
