import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { CacheService } from './cache.service';
import { User } from '../models/user.model';
import { UsersApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

/**
 * API service for managing HTTP requests to ReqRes API
 * Includes integrated caching to avoid redundant requests
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);

  // HTTP headers with API key from environment
  private readonly headers = new HttpHeaders({
    'x-api-key': environment.apiKey,
  });

  constructor() {}

  /**
   * Fetch paginated list of users
   * Caches results to avoid redundant API calls
   * @param page - Page number (1-based)
   * @returns Observable<UsersApiResponse>
   */
  getUsers(page: number): Observable<UsersApiResponse> {
    const cacheKey = `users_page_${page}`;

    // Check if data exists in cache
    const cachedData = this.cache.get<UsersApiResponse>(cacheKey);
    if (cachedData) {
      return new Observable((observer) => {
        observer.next(cachedData);
        observer.complete();
      });
    }

    // Fetch from API if not cached
    return this.http
      .get<UsersApiResponse>(`${this.baseUrl}/users?page=${page}`, {
        headers: this.headers,
      })
      .pipe(
        // Cache the response
        tap((response) => {
          this.cache.set(cacheKey, response);
        }),
      );
  }

  /**
   * Fetch a single user by ID
   * Caches the result to avoid redundant API calls
   * @param userId - User ID
   * @returns Observable<User> with additional metadata wrapped in response
   */
  getUserById(userId: number): Observable<{ data: User }> {
    const cacheKey = `user_${userId}`;

    // Check if data exists in cache
    const cachedData = this.cache.get<{ data: User }>(cacheKey);
    if (cachedData) {
      return new Observable((observer) => {
        observer.next(cachedData);
        observer.complete();
      });
    }

    // Fetch from API if not cached
    return this.http
      .get<{ data: User }>(`${this.baseUrl}/users/${userId}`, {
        headers: this.headers,
      })
      .pipe(
        // Cache the response
        tap((response) => {
          this.cache.set(cacheKey, response);
        }),
      );
  }
}
