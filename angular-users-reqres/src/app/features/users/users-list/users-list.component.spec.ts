import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UsersListComponent } from './users-list.component';
import { ApiService } from '../../../core/services/api.service';
import { UsersApiResponse } from '../../../core/models/api-response.model';
import { User } from '../../../core/models/user.model';
import { PageEvent } from '@angular/material/paginator';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('UsersListComponent', () => {
  let component: UsersListComponent;
  let fixture: ComponentFixture<UsersListComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockUsers: User[] = [
    {
      id: 1,
      email: 'user1@example.com',
      first_name: 'John',
      last_name: 'Doe',
      avatar: 'https://example.com/avatar1.jpg',
    },
    {
      id: 2,
      email: 'user2@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      avatar: 'https://example.com/avatar2.jpg',
    },
  ];

  const mockUsersResponse: UsersApiResponse = {
    page: 1,
    per_page: 6,
    total: 12,
    total_pages: 2,
    data: mockUsers,
  };

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('ApiService', ['getUsers']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [UsersListComponent],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: Router, useValue: mockRouter },
        provideAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load users on initialization', () => {
      mockApiService.getUsers.and.returnValue(of(mockUsersResponse));

      component.ngOnInit();

      expect(mockApiService.getUsers).toHaveBeenCalledWith(1);
      expect(component.users()).toEqual(mockUsers);
      expect(component.currentPage()).toBe(1);
      expect(component.totalPages()).toBe(2);
      expect(component.totalUsers()).toBe(12);
      expect(component.perPage()).toBe(6);
    });

    it('should set loading state correctly during initialization', () => {
      mockApiService.getUsers.and.returnValue(of(mockUsersResponse));

      expect(component.isLoading()).toBe(false);

      component.ngOnInit();

      // After successful load
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('loadUsers', () => {
    it('should load users for specified page', () => {
      mockApiService.getUsers.and.returnValue(of(mockUsersResponse));

      component.loadUsers(1);

      expect(mockApiService.getUsers).toHaveBeenCalledWith(1);
      expect(component.users()).toEqual(mockUsers);
      expect(component.currentPage()).toBe(1);
      expect(component.isLoading()).toBe(false);
      expect(component.error()).toBeNull();
    });

    it('should set loading state while fetching', () => {
      mockApiService.getUsers.and.returnValue(of(mockUsersResponse));

      component.loadUsers(1);

      expect(component.isLoading()).toBe(false); // False after completion
    });

    it('should handle API errors', () => {
      const errorMessage = 'Failed to load users. Please try again.';
      mockApiService.getUsers.and.returnValue(throwError(() => new Error('Network error')));

      component.loadUsers(1);

      expect(component.error()).toBe(errorMessage);
      expect(component.isLoading()).toBe(false);
      expect(component.users()).toEqual([]);
    });

    it('should clear previous errors on new load', () => {
      // First request fails
      mockApiService.getUsers.and.returnValue(throwError(() => new Error('Network error')));
      component.loadUsers(1);
      expect(component.error()).not.toBeNull();

      // Second request succeeds
      mockApiService.getUsers.and.returnValue(of(mockUsersResponse));
      component.loadUsers(1);

      expect(component.error()).toBeNull();
    });

    it('should update all pagination data', () => {
      const page2Response: UsersApiResponse = {
        ...mockUsersResponse,
        page: 2,
        data: [
          {
            id: 3,
            email: 'user3@example.com',
            first_name: 'Bob',
            last_name: 'Johnson',
            avatar: 'https://example.com/avatar3.jpg',
          },
        ],
      };

      mockApiService.getUsers.and.returnValue(of(page2Response));

      component.loadUsers(2);

      expect(component.currentPage()).toBe(2);
      expect(component.users().length).toBe(1);
      expect(component.users()[0].first_name).toBe('Bob');
    });
  });

  describe('onPageChange', () => {
    it('should load users for new page', () => {
      mockApiService.getUsers.and.returnValue(of(mockUsersResponse));

      const pageEvent: PageEvent = {
        pageIndex: 1, // 0-based index (page 2)
        pageSize: 6,
        length: 12,
      };

      component.onPageChange(pageEvent);

      expect(mockApiService.getUsers).toHaveBeenCalledWith(2); // Convert to 1-based
    });

    it('should convert 0-based pageIndex to 1-based page number', () => {
      mockApiService.getUsers.and.returnValue(of(mockUsersResponse));

      const pageEvent: PageEvent = {
        pageIndex: 0,
        pageSize: 6,
        length: 12,
      };

      component.onPageChange(pageEvent);

      expect(mockApiService.getUsers).toHaveBeenCalledWith(1);
    });
  });

  describe('viewUserDetails', () => {
    it('should navigate to user details page', () => {
      const userId = 5;

      component.viewUserDetails(userId);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/user', userId]);
    });
  });

  describe('getFullName', () => {
    it('should return full name from user object', () => {
      const user: User = {
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        avatar: 'https://example.com/avatar.jpg',
      };

      const fullName = component.getFullName(user);

      expect(fullName).toBe('John Doe');
    });

    it('should handle users with different names', () => {
      const user: User = {
        id: 2,
        email: 'test@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        avatar: 'https://example.com/avatar.jpg',
      };

      const fullName = component.getFullName(user);

      expect(fullName).toBe('Jane Smith');
    });
  });

  describe('retryLoadUsers', () => {
    it('should retry loading current page', () => {
      component.currentPage.set(2);
      mockApiService.getUsers.and.returnValue(of(mockUsersResponse));

      component.retryLoadUsers();

      expect(mockApiService.getUsers).toHaveBeenCalledWith(2);
    });
  });

  describe('pageIndex computed signal', () => {
    it('should return 0-based index from 1-based page', () => {
      component.currentPage.set(1);
      expect(component.pageIndex()).toBe(0);

      component.currentPage.set(2);
      expect(component.pageIndex()).toBe(1);

      component.currentPage.set(5);
      expect(component.pageIndex()).toBe(4);
    });
  });

  describe('error handling', () => {
    it('should display error message when API fails', () => {
      mockApiService.getUsers.and.returnValue(throwError(() => new Error('Server error')));

      component.loadUsers(1);

      expect(component.error()).toBe('Failed to load users. Please try again.');
      expect(component.isLoading()).toBe(false);
    });

    it('should allow retry after error', () => {
      // First request fails
      mockApiService.getUsers.and.returnValue(throwError(() => new Error('Network error')));
      component.loadUsers(1);
      expect(component.error()).not.toBeNull();

      // Retry succeeds
      mockApiService.getUsers.and.returnValue(of(mockUsersResponse));
      component.retryLoadUsers();

      expect(component.error()).toBeNull();
      expect(component.users()).toEqual(mockUsers);
    });
  });

  describe('template integration', () => {
    it('should render users when loaded', () => {
      mockApiService.getUsers.and.returnValue(of(mockUsersResponse));

      component.ngOnInit();
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('mat-card')).toBeTruthy();
    });

    it('should not display error when there is no error', () => {
      mockApiService.getUsers.and.returnValue(of(mockUsersResponse));

      component.ngOnInit();
      fixture.detectChanges();

      expect(component.error()).toBeNull();
    });
  });
});
