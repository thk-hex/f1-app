import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChampionsModule } from './champions/champions.module';
import { RaceWinnersModule } from './race-winners/race-winners.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisCacheModule } from './cache/cache.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SecurityModule } from './security/security.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisCacheModule,
    ChampionsModule,
    RaceWinnersModule,
    SchedulerModule,
    SecurityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
