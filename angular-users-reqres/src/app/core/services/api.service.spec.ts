import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { CacheService } from './cache.service';
import { UsersApiResponse } from '../models/api-response.model';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  let cacheService: CacheService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    avatar: 'https://example.com/avatar.jpg',
  };

  const mockUsersResponse: UsersApiResponse = {
    page: 1,
    per_page: 6,
    total: 12,
    total_pages: 2,
    data: [
      mockUser,
      {
        id: 2,
        email: 'jane@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        avatar: 'https://example.com/avatar2.jpg',
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiService, CacheService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
    cacheService = TestBed.inject(CacheService);
  });

  afterEach(() => {
    httpMock.verify();
    cacheService.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUsers', () => {
    it('should fetch users from API', (done) => {
      const page = 1;

      service.getUsers(page).subscribe((response) => {
        expect(response).toEqual(mockUsersResponse);
        expect(response.data.length).toBe(2);
        expect(response.page).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users?page=${page}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('x-api-key')).toBe(environment.apiKey);
      req.flush(mockUsersResponse);
    });

    it('should cache the response', (done) => {
      const page = 1;

      service.getUsers(page).subscribe(() => {
        // Make second request
        service.getUsers(page).subscribe((response) => {
          expect(response).toEqual(mockUsersResponse);
          done();
        });

        // No HTTP request should be made for cached data
        httpMock.expectNone(`${environment.apiUrl}/users?page=${page}`);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users?page=${page}`);
      req.flush(mockUsersResponse);
    });

    it('should return cached data immediately', (done) => {
      const page = 1;
      const cacheKey = `users_page_${page}`;

      // Pre-populate cache
      cacheService.set(cacheKey, mockUsersResponse);

      service.getUsers(page).subscribe((response) => {
        expect(response).toEqual(mockUsersResponse);
        done();
      });

      // No HTTP request should be made
      httpMock.expectNone(`${environment.apiUrl}/users?page=${page}`);
    });

    it('should fetch different pages separately', (done) => {
      const page1Response = { ...mockUsersResponse, page: 1 };
      const page2Response = { ...mockUsersResponse, page: 2 };

      service.getUsers(1).subscribe((response) => {
        expect(response.page).toBe(1);
      });

      service.getUsers(2).subscribe((response) => {
        expect(response.page).toBe(2);
        done();
      });

      const req1 = httpMock.expectOne(`${environment.apiUrl}/users?page=1`);
      req1.flush(page1Response);

      const req2 = httpMock.expectOne(`${environment.apiUrl}/users?page=2`);
      req2.flush(page2Response);
    });

    it('should handle API errors', (done) => {
      const page = 1;
      const errorMessage = 'Server error';

      service.getUsers(page).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users?page=${page}`);
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getUserById', () => {
    it('should fetch user by ID from API', (done) => {
      const userId = 1;
      const mockResponse = { data: mockUser };

      service.getUserById(userId).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.data.id).toBe(userId);
        expect(response.data.first_name).toBe('John');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/${userId}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('x-api-key')).toBe(environment.apiKey);
      req.flush(mockResponse);
    });

    it('should cache the user response', (done) => {
      const userId = 1;
      const mockResponse = { data: mockUser };

      service.getUserById(userId).subscribe(() => {
        // Make second request
        service.getUserById(userId).subscribe((response) => {
          expect(response).toEqual(mockResponse);
          done();
        });

        // No HTTP request should be made for cached data
        httpMock.expectNone(`${environment.apiUrl}/users/${userId}`);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/${userId}`);
      req.flush(mockResponse);
    });

    it('should return cached user data immediately', (done) => {
      const userId = 1;
      const cacheKey = `user_${userId}`;
      const mockResponse = { data: mockUser };

      // Pre-populate cache
      cacheService.set(cacheKey, mockResponse);

      service.getUserById(userId).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        done();
      });

      // No HTTP request should be made
      httpMock.expectNone(`${environment.apiUrl}/users/${userId}`);
    });

    it('should fetch different users separately', (done) => {
      const user1Response = { data: mockUser };
      const user2 = { ...mockUser, id: 2, first_name: 'Jane' };
      const user2Response = { data: user2 };

      service.getUserById(1).subscribe((response) => {
        expect(response.data.id).toBe(1);
      });

      service.getUserById(2).subscribe((response) => {
        expect(response.data.id).toBe(2);
        done();
      });

      const req1 = httpMock.expectOne(`${environment.apiUrl}/users/1`);
      req1.flush(user1Response);

      const req2 = httpMock.expectOne(`${environment.apiUrl}/users/2`);
      req2.flush(user2Response);
    });

    it('should handle 404 errors for non-existent users', (done) => {
      const userId = 999;

      service.getUserById(userId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/${userId}`);
      req.flush('User not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle API errors', (done) => {
      const userId = 1;

      service.getUserById(userId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/${userId}`);
      req.flush('Server error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('HTTP headers', () => {
    it('should include API key header in getUsers request', () => {
      service.getUsers(1).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/users?page=1`);
      expect(req.request.headers.has('x-api-key')).toBe(true);
      expect(req.request.headers.get('x-api-key')).toBe(environment.apiKey);
      req.flush(mockUsersResponse);
    });

    it('should include API key header in getUserById request', () => {
      service.getUserById(1).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
      expect(req.request.headers.has('x-api-key')).toBe(true);
      expect(req.request.headers.get('x-api-key')).toBe(environment.apiKey);
      req.flush({ data: mockUser });
    });
  });
});
