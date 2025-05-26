import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RaceWinnersService } from './race-winners.service';
import { RaceDto } from './dto/race.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('race-winners')
@Controller('race-winners')
export class RaceWinnersController {
  constructor(private readonly raceWinnersService: RaceWinnersService) {}

  @Get(':year')
  @ApiOperation({ summary: 'Get all race winners for a specific year' })
  @ApiParam({
    name: 'year',
    description: 'The year to fetch race winners for',
    example: 2021,
  })
  @ApiResponse({
    status: 200,
    description: 'List of race winners for the specified year',
    type: [RaceDto],
  })
  async getRaceWinners(
    @Param('year', ParseIntPipe) year: number,
  ): Promise<RaceDto[]> {
    return this.raceWinnersService.getRaceWinners(year);
  }
}
