import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

/**
 * HTTP Interceptor for tracking loading state
 * Uses LoadingService to manage loading state reactively
 * Increments counter on request start, decrements on completion/error
 */
@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private loadingService = inject(LoadingService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Increment active requests counter
    this.loadingService.startLoading();

    return next.handle(req).pipe(
      finalize(() => {
        // Decrement active requests counter
        this.loadingService.stopLoading();
      }),
    );
  }
}
