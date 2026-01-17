import { Injectable, inject } from '@angular/core';
import { LoadingInterceptor } from '../interceptors/loading.interceptor';

/**
 * Service to manage and expose loading state globally
 * Works in conjunction with LoadingInterceptor
 * Exposes signals directly for reactive consumption
 */
@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly loadingInterceptor = inject(LoadingInterceptor);

  // Expose signals directly from the interceptor for reactive consumption
  get isLoading() {
    return this.loadingInterceptor.isLoading;
  }

  get activeRequestsCount() {
    return this.loadingInterceptor.activeRequestsCount;
  }
}
