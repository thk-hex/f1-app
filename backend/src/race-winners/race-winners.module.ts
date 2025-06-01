import { Module } from '@nestjs/common';
import { RaceWinnersController } from './race-winners.controller';
import { RaceWinnersService } from './race-winners.service';
import { HttpModule } from '@nestjs/axios';
import { RaceWinnersMapper } from './race-winners.mapper';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [HttpModule, PrismaModule],
  providers: [RaceWinnersService, RaceWinnersMapper],
  controllers: [RaceWinnersController],
  exports: [RaceWinnersService, RaceWinnersMapper],
})
export class RaceWinnersModule {}
