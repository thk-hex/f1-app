import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from './cache.service';

export interface CacheOptions {
  key?: string;
  ttl?: number;
}

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private readonly cacheService: CacheService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const cacheOptions: CacheOptions = Reflect.getMetadata(
      'cache:options',
      context.getHandler(),
    );

    if (!cacheOptions) {
      return next.handle();
    }

    // Generate cache key
    const cacheKey =
      cacheOptions.key ||
      `${context.getClass().name}:${context.getHandler().name}:${JSON.stringify(request.params)}:${JSON.stringify(request.query)}`;

    // Try to get from cache
    const cachedResult = await this.cacheService.get(cacheKey);
    if (cachedResult !== undefined) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return of(cachedResult);
    }

    // If not in cache, execute method and cache result
    console.log(`Cache miss for key: ${cacheKey}`);
    return next.handle().pipe(
      tap(async (data) => {
        if (data !== undefined && data !== null) {
          await this.cacheService.set(cacheKey, data, cacheOptions.ttl);
          console.log(`Cached result for key: ${cacheKey}`);
        }
      }),
    );
  }
}
