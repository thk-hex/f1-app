import { Controller, Get } from '@nestjs/common';
import { ChampionsService } from './champions.service';
import { SeasonDto } from './dto/season.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('champions')
@Controller('champions')
export class ChampionsController {
  constructor(private readonly championsService: ChampionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all F1 champions',
    description:
      'Retrieves all Formula 1 World Champions from the current year to the configured start year (GP_START_YEAR) in descending order. The GP_START_YEAR must be between 1950 (when F1 started) and the current year.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all F1 champions by season in descending order (most recent first)',
    type: [SeasonDto],
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - GP_START_YEAR is invalid (before 1950 or after current year)',
  })
  async getChampions(): Promise<SeasonDto[]> {
    return this.championsService.getChampions();
  }
}
