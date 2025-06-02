import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { SchedulerController } from './scheduler.controller';
import { ChampionsModule } from '../champions/champions.module';
import { RaceWinnersModule } from '../race-winners/race-winners.module';

@Module({
  imports: [ScheduleModule.forRoot(), ChampionsModule, RaceWinnersModule],
  providers: [SchedulerService],
  controllers: [SchedulerController],
  exports: [SchedulerService],
})
export class SchedulerModule {}
