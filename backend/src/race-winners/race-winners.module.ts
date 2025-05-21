import { Module } from '@nestjs/common';
import { RaceWinnersController } from './race-winners.controller';
import { RaceWinnersService } from './race-winners.service';

@Module({
  controllers: [RaceWinnersController],
  providers: [RaceWinnersService]
})
export class RaceWinnersModule {}
