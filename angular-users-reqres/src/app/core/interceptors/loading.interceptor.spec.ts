import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { LoadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

describe('LoadingInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let loadingService: LoadingService;
  let interceptor: LoadingInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoadingService,
        LoadingInterceptor,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: HTTP_INTERCEPTORS,
          useClass: LoadingInterceptor,
          multi: true,
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService);
    interceptor = TestBed.inject(LoadingInterceptor);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should track loading state for successful requests', (done) => {
    expect(loadingService.isLoading()).toBe(false);

    httpClient.get('/test').subscribe({
      next: () => {
        // After completion
        expect(loadingService.activeRequestsCount()).toBe(0);
        expect(loadingService.isLoading()).toBe(false);
        done();
      },
    });

    // Request is pending
    const req = httpMock.expectOne('/test');
    expect(req.request.method).toBe('GET');

    // Complete the request
    req.flush({ data: 'test' });
  });

  it('should track loading state for failed requests', (done) => {
    expect(loadingService.isLoading()).toBe(false);

    httpClient.get('/test').subscribe({
      next: () => fail('Should have failed'),
      error: () => {
        // After error
        expect(loadingService.activeRequestsCount()).toBe(0);
        expect(loadingService.isLoading()).toBe(false);
        done();
      },
    });

    const req = httpMock.expectOne('/test');
    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });

  it('should handle multiple concurrent requests', (done) => {
    let completedCount = 0;
    const checkCompletion = () => {
      completedCount++;
      if (completedCount === 3) {
        expect(loadingService.activeRequestsCount()).toBe(0);
        expect(loadingService.isLoading()).toBe(false);
        done();
      }
    };

    httpClient.get('/test1').subscribe(() => checkCompletion());
    httpClient.get('/test2').subscribe(() => checkCompletion());
    httpClient.get('/test3').subscribe(() => checkCompletion());

    // Complete requests one by one
    const req1 = httpMock.expectOne('/test1');
    req1.flush({});

    const req2 = httpMock.expectOne('/test2');
    req2.flush({});

    const req3 = httpMock.expectOne('/test3');
    req3.flush({});
  });

  it('should handle mixed success and error responses', (done) => {
    let completedCount = 0;
    const checkCompletion = () => {
      completedCount++;
      if (completedCount === 2) {
        expect(loadingService.activeRequestsCount()).toBe(0);
        expect(loadingService.isLoading()).toBe(false);
        done();
      }
    };

    httpClient.get('/success').subscribe(() => checkCompletion());
    httpClient.get('/error').subscribe({
      next: () => fail('Should have failed'),
      error: () => checkCompletion(),
    });

    // Success response
    const req1 = httpMock.expectOne('/success');
    req1.flush({ data: 'success' });

    // Error response
    const req2 = httpMock.expectOne('/error');
    req2.flush('Error', { status: 404, statusText: 'Not Found' });
  });

  it('should track POST requests', (done) => {
    httpClient.post('/test', { data: 'test' }).subscribe({
      next: () => {
        expect(loadingService.activeRequestsCount()).toBe(0);
        expect(loadingService.isLoading()).toBe(false);
        done();
      },
    });

    const req = httpMock.expectOne('/test');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });

  it('should track PUT requests', (done) => {
    httpClient.put('/test', { data: 'test' }).subscribe({
      next: () => {
        expect(loadingService.activeRequestsCount()).toBe(0);
        expect(loadingService.isLoading()).toBe(false);
        done();
      },
    });

    const req = httpMock.expectOne('/test');
    expect(req.request.method).toBe('PUT');
    req.flush({ success: true });
  });

  it('should track DELETE requests', (done) => {
    httpClient.delete('/test').subscribe({
      next: () => {
        expect(loadingService.activeRequestsCount()).toBe(0);
        expect(loadingService.isLoading()).toBe(false);
        done();
      },
    });

    const req = httpMock.expectOne('/test');
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });

  it('should handle rapid sequential requests', (done) => {
    let completedCount = 0;
    const totalRequests = 5;

    const checkCompletion = () => {
      completedCount++;
      if (completedCount === totalRequests) {
        expect(loadingService.activeRequestsCount()).toBe(0);
        expect(loadingService.isLoading()).toBe(false);
        done();
      }
    };

    // Make 5 requests rapidly
    for (let i = 0; i < totalRequests; i++) {
      httpClient.get(`/test${i}`).subscribe(() => checkCompletion());
    }

    // Complete all requests
    for (let i = 0; i < totalRequests; i++) {
      const req = httpMock.expectOne(`/test${i}`);
      req.flush({});
    }
  });
});
