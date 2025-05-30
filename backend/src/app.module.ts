import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChampionsModule } from './champions/champions.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RaceWinnersModule } from './race-winners/race-winners.module';
import { RedisCacheModule } from './cache/cache.module';
import { 
  SecurityMiddleware, 
  RequestLoggingMiddleware, 
  InputValidationMiddleware 
} from './shared/middleware/security.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    RedisCacheModule,
    ChampionsModule,
    PrismaModule,
    RaceWinnersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware, RequestLoggingMiddleware, InputValidationMiddleware)
      .forRoutes('*'); // Apply to all routes
  }
}
