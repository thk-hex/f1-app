import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Keyv } from 'keyv';
import KeyvRedis from '@keyv/redis';
import { CacheService } from './cache.service';
import { CacheController } from './cache.controller';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
        const redisPort = configService.get<number>('REDIS_PORT', 6379);

        // Create Redis store using Keyv
        const redisStore = new KeyvRedis(`redis://${redisHost}:${redisPort}`);
        
        return {
          store: new Keyv({ store: redisStore }),
          ttl: 300 * 1000, // TTL in milliseconds for cache-manager v6
          isGlobal: true,
        };
      },
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  providers: [CacheService],
  controllers: [CacheController],
  exports: [CacheService],
})
export class RedisCacheModule {} 