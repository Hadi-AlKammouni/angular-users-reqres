import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadingService],
    });
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have activeRequestsCount as 0', () => {
      expect(service.activeRequestsCount()).toBe(0);
    });

    it('should have isLoading as false', () => {
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('startLoading', () => {
    it('should increment activeRequestsCount', () => {
      service.startLoading();
      expect(service.activeRequestsCount()).toBe(1);

      service.startLoading();
      expect(service.activeRequestsCount()).toBe(2);
    });

    it('should set isLoading to true', () => {
      service.startLoading();
      expect(service.isLoading()).toBe(true);
    });

    it('should handle multiple requests', () => {
      service.startLoading();
      service.startLoading();
      service.startLoading();

      expect(service.activeRequestsCount()).toBe(3);
      expect(service.isLoading()).toBe(true);
    });
  });

  describe('stopLoading', () => {
    it('should decrement activeRequestsCount', () => {
      service.startLoading();
      service.startLoading();
      expect(service.activeRequestsCount()).toBe(2);

      service.stopLoading();
      expect(service.activeRequestsCount()).toBe(1);
    });

    it('should set isLoading to false when count reaches 0', () => {
      service.startLoading();
      expect(service.isLoading()).toBe(true);

      service.stopLoading();
      expect(service.isLoading()).toBe(false);
      expect(service.activeRequestsCount()).toBe(0);
    });

    it('should not go below 0 when called more times than startLoading', () => {
      service.startLoading();
      service.stopLoading();
      service.stopLoading();

      expect(service.activeRequestsCount()).toBe(0);
      expect(service.isLoading()).toBe(false);
    });

    it('should keep isLoading true if other requests are active', () => {
      service.startLoading();
      service.startLoading();
      service.startLoading();

      service.stopLoading();

      expect(service.activeRequestsCount()).toBe(2);
      expect(service.isLoading()).toBe(true);
    });
  });

  describe('concurrent requests', () => {
    it('should correctly handle multiple concurrent requests', () => {
      // Simulate 3 requests starting
      service.startLoading();
      service.startLoading();
      service.startLoading();

      expect(service.activeRequestsCount()).toBe(3);
      expect(service.isLoading()).toBe(true);

      // First request completes
      service.stopLoading();
      expect(service.activeRequestsCount()).toBe(2);
      expect(service.isLoading()).toBe(true);

      // Second request completes
      service.stopLoading();
      expect(service.activeRequestsCount()).toBe(1);
      expect(service.isLoading()).toBe(true);

      // Third request completes
      service.stopLoading();
      expect(service.activeRequestsCount()).toBe(0);
      expect(service.isLoading()).toBe(false);
    });

    it('should handle rapid start and stop', () => {
      service.startLoading();
      service.stopLoading();
      service.startLoading();
      service.stopLoading();

      expect(service.activeRequestsCount()).toBe(0);
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle stopLoading called without startLoading', () => {
      expect(() => service.stopLoading()).not.toThrow();
      expect(service.activeRequestsCount()).toBe(0);
      expect(service.isLoading()).toBe(false);
    });

    it('should handle large number of concurrent requests', () => {
      const requestCount = 100;

      for (let i = 0; i < requestCount; i++) {
        service.startLoading();
      }

      expect(service.activeRequestsCount()).toBe(requestCount);
      expect(service.isLoading()).toBe(true);

      for (let i = 0; i < requestCount; i++) {
        service.stopLoading();
      }

      expect(service.activeRequestsCount()).toBe(0);
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('signal reactivity', () => {
    it('should emit signal updates on state changes', () => {
      const loadingStates: boolean[] = [];
      const countStates: number[] = [];

      // Track signal values
      loadingStates.push(service.isLoading());
      countStates.push(service.activeRequestsCount());

      service.startLoading();
      loadingStates.push(service.isLoading());
      countStates.push(service.activeRequestsCount());

      service.startLoading();
      loadingStates.push(service.isLoading());
      countStates.push(service.activeRequestsCount());

      service.stopLoading();
      loadingStates.push(service.isLoading());
      countStates.push(service.activeRequestsCount());

      service.stopLoading();
      loadingStates.push(service.isLoading());
      countStates.push(service.activeRequestsCount());

      expect(loadingStates).toEqual([false, true, true, true, false]);
      expect(countStates).toEqual([0, 1, 2, 1, 0]);
    });
  });
});
