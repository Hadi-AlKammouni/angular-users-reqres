import { Injectable, signal } from '@angular/core';

/**
 * Service to manage and expose loading state globally
 * Works in conjunction with LoadingInterceptor
 * Exposes signals directly for reactive consumption
 */
@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  // Signal to track number of active requests
  readonly activeRequestsCount = signal(0);

  // Signal for loading state (true if any request is active)
  readonly isLoading = signal(false);

  /**
   * Increment active requests counter
   */
  startLoading(): void {
    this.activeRequestsCount.update((count) => count + 1);
    this.updateLoadingState();
  }

  /**
   * Decrement active requests counter
   */
  stopLoading(): void {
    this.activeRequestsCount.update((count) => Math.max(0, count - 1));
    this.updateLoadingState();
  }

  /**
   * Update loading state based on active requests count
   */
  private updateLoadingState(): void {
    this.isLoading.set(this.activeRequestsCount() > 0);
  }
}
