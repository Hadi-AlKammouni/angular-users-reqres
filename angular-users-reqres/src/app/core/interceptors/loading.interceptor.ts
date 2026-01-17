import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

/**
 * HTTP Interceptor for tracking loading state
 * Uses signals to manage loading state reactively
 * Increments counter on request start, decrements on completion/error
 */
@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  // Signal to track number of active requests (publicly accessible for reactive consumption)
  activeRequestsCount = signal(0);

  // Signal for loading state (true if any request is active)
  isLoading = signal(false);

  constructor() {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Increment active requests counter
    this.activeRequestsCount.update((count) => count + 1);
    this.updateLoadingState();

    return next.handle(req).pipe(
      finalize(() => {
        // Decrement active requests counter
        this.activeRequestsCount.update((count) => Math.max(0, count - 1));
        this.updateLoadingState();
      }),
    );
  }

  /**
   * Update loading state based on active requests count
   * Loading is true when any request is active (count > 0)
   */
  private updateLoadingState(): void {
    this.isLoading.set(this.activeRequestsCount() > 0);
  }
}
