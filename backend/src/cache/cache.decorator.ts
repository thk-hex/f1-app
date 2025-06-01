import { SetMetadata } from '@nestjs/common';
import { CacheOptions } from './cache.interceptor';

export const CACHE_KEY = 'cache:options';

/**
 * Decorator to enable caching for a method
 * @param options Cache configuration options
 */
export const Cacheable = (options: CacheOptions = {}) =>
  SetMetadata(CACHE_KEY, options);
