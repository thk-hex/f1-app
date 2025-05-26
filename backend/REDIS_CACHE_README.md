# Redis Cache Implementation

This document describes the Redis cache implementation for the F1 backend application, designed to provide faster cold starts and improved performance by caching data between the backend and database.

## Overview

The Redis cache layer sits between your NestJS backend and the database, providing:
- **Faster cold starts** by caching frequently accessed data
- **Reduced database load** by serving cached responses
- **Configurable TTL** for different types of data
- **Health monitoring** and cache management endpoints
- **Automatic fallback** to database when cache misses occur

## Architecture

```
Client → Backend → Redis Cache → Database
                      ↓
                 Cache Hit/Miss
```

### Cache Strategy (Cache-Aside Pattern)

1. **Cache Hit**: Data is served directly from Redis
2. **Cache Miss**: Data is fetched from database and cached in Redis
3. **Cache Invalidation**: Manual or TTL-based expiration

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
REDIS_HOST=redis
REDIS_PORT=6379
```

### Cache TTL Configuration

Different data types have different cache durations:

- **Champions Data**: 1 hour (3600 seconds)
- **Race Winners**: 30 minutes (1800 seconds)
- **Default**: 5 minutes (300 seconds)

## Features

### 1. Automatic Caching in Services

Both `ChampionsService` and `RaceWinnersService` implement a three-tier caching strategy:

1. **Redis Cache** (fastest)
2. **Database Cache** (medium)
3. **External API** (slowest)

### 2. Cache Management Endpoints

#### Health Check
```http
GET /cache/health
```
Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "cache": "redis"
}
```

#### Cache Statistics
```http
GET /cache/stats
```

#### Clear Champions Cache
```http
DELETE /cache/champions
```

#### Clear Race Winners Cache (specific year)
```http
DELETE /cache/race-winners/2023
```

#### Clear All Race Winners Cache
```http
DELETE /cache/race-winners
```

### 3. Cache Service Methods

The `CacheService` provides these methods:

```typescript
// Get cached data
await cacheService.get<T>(key: string): Promise<T | undefined>

// Set cached data with TTL
await cacheService.set<T>(key: string, value: T, ttl?: number): Promise<void>

// Delete cached data
await cacheService.del(key: string): Promise<void>

// Delete by pattern (simplified implementation)
await cacheService.delByPattern(pattern: string): Promise<void>

// Health check
await cacheService.isHealthy(): Promise<boolean>

// Get cache statistics
await cacheService.getStats(): Promise<any>
```

### 4. Cache Keys

The system uses structured cache keys:

- **Champions**: `champions`
- **Race Winners**: `race_winners:${year}`

## Usage Examples

### Service Implementation

```typescript
@Injectable()
export class ExampleService {
  constructor(private readonly cacheService: CacheService) {}

  async getData(id: string) {
    const cacheKey = `data:${id}`;
    
    // Try cache first
    const cached = await this.cacheService.get<DataType>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const data = await this.database.findById(id);
    
    // Cache the result
    await this.cacheService.set(cacheKey, data, CacheTTL.DEFAULT);
    
    return data;
  }
}
```

### Using Cache Decorator (Optional)

```typescript
import { Cacheable, CacheInterceptor } from '../cache';

@Controller('example')
@UseInterceptors(CacheInterceptor)
export class ExampleController {
  
  @Get(':id')
  @Cacheable({ ttl: 300 }) // Cache for 5 minutes
  async findOne(@Param('id') id: string) {
    // This method's response will be automatically cached
    return this.service.findOne(id);
  }
}
```

## Performance Benefits

### Cold Start Improvements

1. **First Request**: API → Database → Cache (slower)
2. **Subsequent Requests**: Cache → Response (much faster)
3. **Cache Expiry**: Database → Cache refresh

### Metrics

- **Cache Hit**: ~1-5ms response time
- **Database Hit**: ~50-200ms response time
- **API Hit**: ~500-2000ms response time

## Monitoring

### Health Checks

The cache health endpoint (`/cache/health`) performs:
1. Write test data to cache
2. Read test data from cache
3. Delete test data from cache
4. Return health status

### Logging

The implementation includes comprehensive logging:
- Cache hits/misses
- Error handling
- Performance metrics

## Error Handling

The cache implementation is designed to be resilient:

1. **Cache Failures**: Gracefully fall back to database
2. **Redis Unavailable**: Continue serving from database
3. **Timeout Handling**: Configurable timeouts prevent hanging

## Best Practices

### 1. Cache Key Naming
- Use consistent, hierarchical naming
- Include version numbers for schema changes
- Use meaningful prefixes

### 2. TTL Strategy
- Short TTL for frequently changing data
- Long TTL for static/historical data
- Consider business requirements

### 3. Cache Invalidation
- Implement manual invalidation for critical updates
- Use pattern-based deletion carefully
- Monitor cache hit rates

### 4. Memory Management
- Set appropriate max cache size
- Monitor Redis memory usage
- Implement cache eviction policies

## Troubleshooting

### Common Issues

1. **Cache Not Working**
   - Check Redis connection
   - Verify environment variables
   - Check service logs

2. **High Memory Usage**
   - Review TTL settings
   - Check for cache key leaks
   - Monitor eviction policies

3. **Stale Data**
   - Verify TTL configuration
   - Check manual invalidation logic
   - Review cache key generation

### Debug Commands

```bash
# Check Redis connection
redis-cli -h redis -p 6379 ping

# List all cache keys
redis-cli -h redis -p 6379 keys "*"

# Get cache value
redis-cli -h redis -p 6379 get "champions"

# Clear all cache
redis-cli -h redis -p 6379 flushall
```

## Dependencies

- `@nestjs/cache-manager`: ^3.0.1
- `cache-manager`: ^6.1.0
- `cache-manager-redis-store`: ^3.0.1
- `ioredis`: ^5.4.1

## Future Enhancements

1. **Advanced Pattern Deletion**: Implement Redis-specific pattern matching
2. **Cache Warming**: Pre-populate cache with frequently accessed data
3. **Distributed Caching**: Support for Redis Cluster
4. **Cache Analytics**: Detailed metrics and monitoring
5. **Compression**: Compress large cached objects
6. **Encryption**: Encrypt sensitive cached data

## Security Considerations

1. **Redis Security**: Use Redis AUTH if needed
2. **Data Sensitivity**: Avoid caching sensitive information
3. **Network Security**: Use Redis over secure networks
4. **Access Control**: Limit cache management endpoint access

---

This Redis cache implementation provides a robust, scalable caching layer that significantly improves application performance while maintaining data consistency and reliability. 