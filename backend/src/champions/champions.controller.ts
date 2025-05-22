import { Controller, Get } from '@nestjs/common';
import { ChampionsService } from './champions.service';
import { SeasonDto } from './dto/season.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('champions')
@Controller('champions')
export class ChampionsController {
  constructor(private readonly championsService: ChampionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all F1 champions' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all F1 champions by season',
    type: [SeasonDto] 
  })
  async getChampions(): Promise<SeasonDto[]> {
    return this.championsService.getChampions();
  }
}
