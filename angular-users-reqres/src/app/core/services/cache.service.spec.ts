import { TestBed } from '@angular/core/testing';
import { CacheService } from './cache.service';
import { CACHE_CONFIG } from '../constants';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CacheService],
    });
    service = TestBed.inject(CacheService);
  });

  afterEach(() => {
    service.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('set and get', () => {
    it('should store and retrieve a value', () => {
      const key = 'test_key';
      const value = { data: 'test data' };

      service.set(key, value);
      const retrieved = service.get(key);

      expect(retrieved).toEqual(value);
    });

    it('should store and retrieve different data types', () => {
      service.set('string_key', 'test string');
      service.set('number_key', 42);
      service.set('boolean_key', true);
      service.set('object_key', { nested: { value: 'test' } });
      service.set('array_key', [1, 2, 3]);

      expect(service.get('string_key')).toBe('test string');
      expect(service.get('number_key')).toBe(42);
      expect(service.get('boolean_key')).toBe(true);
      expect(service.get('object_key')).toEqual({ nested: { value: 'test' } });
      expect(service.get('array_key')).toEqual([1, 2, 3]);
    });

    it('should return null for non-existent key', () => {
      expect(service.get('non_existent')).toBeNull();
    });

    it('should overwrite existing value', () => {
      const key = 'test_key';
      service.set(key, 'first value');
      service.set(key, 'second value');

      expect(service.get(key)).toBe('second value');
    });
  });

  describe('expiration', () => {
    it('should return null for expired cache', (done) => {
      const key = 'expire_test';
      const value = 'test data';
      const ttl = 100; // 100ms

      service.set(key, value, ttl);

      // Verify it exists immediately
      expect(service.get(key)).toBe(value);

      // Wait for expiration
      setTimeout(() => {
        expect(service.get(key)).toBeNull();
        done();
      }, ttl + 50);
    });

    it('should use default TTL if not provided', () => {
      const key = 'default_ttl_test';
      const value = 'test data';

      service.set(key, value);
      const retrieved = service.get(key);

      expect(retrieved).toBe(value);
    });

    it('should not expire before TTL', (done) => {
      const key = 'not_expire_test';
      const value = 'test data';
      const ttl = 1000; // 1 second

      service.set(key, value, ttl);

      setTimeout(() => {
        expect(service.get(key)).toBe(value);
        done();
      }, ttl / 2);
    });
  });

  describe('delete', () => {
    it('should delete a specific cache entry', () => {
      service.set('key1', 'value1');
      service.set('key2', 'value2');

      service.delete('key1');

      expect(service.get('key1')).toBeNull();
      expect(service.get('key2')).toBe('value2');
    });

    it('should not throw error when deleting non-existent key', () => {
      expect(() => service.delete('non_existent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all cache entries', () => {
      service.set('key1', 'value1');
      service.set('key2', 'value2');
      service.set('key3', 'value3');

      service.clear();

      expect(service.get('key1')).toBeNull();
      expect(service.get('key2')).toBeNull();
      expect(service.get('key3')).toBeNull();
    });

    it('should handle clearing empty cache', () => {
      expect(() => service.clear()).not.toThrow();
    });
  });

  describe('type safety', () => {
    it('should maintain type information with generics', () => {
      interface TestData {
        id: number;
        name: string;
      }

      const key = 'typed_test';
      const value: TestData = { id: 1, name: 'Test' };

      service.set<TestData>(key, value);
      const retrieved = service.get<TestData>(key);

      expect(retrieved).toEqual(value);
      expect(retrieved?.id).toBe(1);
      expect(retrieved?.name).toBe('Test');
    });
  });
});
