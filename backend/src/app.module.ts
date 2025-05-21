import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChampionsModule } from './champions/champions.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RaceWinnersModule } from './race-winners/race-winners.module';
import { RaceWinnerController } from './race-winner/race-winner.controller';

@Module({
  imports: [
    ChampionsModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    PrismaModule,
    RaceWinnersModule,
  ],
  controllers: [AppController, RaceWinnerController],
  providers: [AppService],
})
export class AppModule {}
