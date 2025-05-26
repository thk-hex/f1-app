import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export enum CacheKeys {
  CHAMPIONS = 'champions',
  RACE_WINNERS = 'race_winners',
}

export enum CacheTTL {
  CHAMPIONS = 3600 * 1000, // 1 hour for champions data (in milliseconds)
  RACE_WINNERS = 1800 * 1000, // 30 minutes for race winners (in milliseconds)
  DEFAULT = 300 * 1000, // 5 minutes default (in milliseconds)
}

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get cached data by key
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error.message);
      return undefined;
    }
  }

  /**
   * Set cached data with TTL
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error.message);
    }
  }

  /**
   * Delete cached data by key
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error.message);
    }
  }

  /**
   * Delete cached data by pattern
   */
  async delByPattern(pattern: string): Promise<void> {
    try {
      // Note: Pattern deletion is not directly supported in cache-manager v6
      // This is a simplified implementation that would need Redis-specific logic
      console.warn(`Pattern deletion for ${pattern} is not implemented in this cache version`);
    } catch (error) {
      console.error(`Cache pattern delete error for pattern ${pattern}:`, error.message);
    }
  }

  /**
   * Check if cache is healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      const testKey = 'health_check';
      const testValue = 'ok';
      await this.set(testKey, testValue, 1);
      const result = await this.get(testKey);
      await this.del(testKey);
      return result === testValue;
    } catch (error) {
      console.error('Cache health check failed:', error.message);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    try {
      // Note: Cache statistics are not directly available in cache-manager v6
      // This would require Redis-specific implementation
      return { message: 'Cache stats not available in this version' };
    } catch (error) {
      console.error('Error getting cache stats:', error.message);
      return null;
    }
  }

  /**
   * Generate cache key for champions
   */
  getChampionsKey(): string {
    return CacheKeys.CHAMPIONS;
  }

  /**
   * Generate cache key for race winners by year
   */
  getRaceWinnersKey(year: number): string {
    return `${CacheKeys.RACE_WINNERS}:${year}`;
  }
} 