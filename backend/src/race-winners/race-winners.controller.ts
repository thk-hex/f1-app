import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RaceWinnersService } from './race-winners.service';
import { RaceDto } from './dto/race.dto';

@Controller('race-winners')
export class RaceWinnersController {
  constructor(private readonly raceWinnersService: RaceWinnersService) {}

  @Get(':year')
  async getRaceWinners(@Param('year', ParseIntPipe) year: number): Promise<RaceDto[]> {
    return this.raceWinnersService.getRaceWinners(year);
  }
}
