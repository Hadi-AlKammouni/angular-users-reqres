import { Injectable } from '@angular/core';
import { CACHE_CONFIG } from '../constants';

/**
 * Generic cache service with configurable TTL (Time To Live)
 * Stores key-value pairs with automatic expiration
 */
@Injectable({
  providedIn: 'root',
})
export class CacheService {
  private cache = new Map<
    string,
    {
      value: unknown;
      expirationTime: number;
    }
  >();

  constructor() {}

  /**
   * Get a value from cache
   * @param key - The cache key
   * @returns The cached value if found and not expired, null otherwise
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check if cache has expired
    if (Date.now() > item.expirationTime) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  /**
   * Set a value in cache with TTL
   * @param key - The cache key
   * @param value - The value to cache
   * @param ttl - Time to live in milliseconds (uses default if not provided)
   */
  set<T>(key: string, value: T, ttl: number = CACHE_CONFIG.EXPIRATION_MS): void {
    const expirationTime = Date.now() + ttl;
    this.cache.set(key, {
      value,
      expirationTime,
    });
  }

  /**
   * Check if a key exists in cache and is not expired
   * @param key - The cache key
   * @returns True if key exists and is valid, false otherwise
   */
  has(key: string): boolean {
    const item = this.cache.get(key);

    if (!item) {
      return false;
    }

    // Check if cache has expired
    if (Date.now() > item.expirationTime) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear a specific cache entry
   * @param key - The cache key to remove
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }
}
