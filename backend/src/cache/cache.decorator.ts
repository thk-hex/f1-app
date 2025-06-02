import { SetMetadata } from '@nestjs/common';
import { CacheOptions } from './cache.interceptor';

export const CACHE_KEY = 'cache:options';

export const Cacheable = (options: CacheOptions = {}) =>
  SetMetadata(CACHE_KEY, options);
