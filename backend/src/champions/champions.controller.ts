import { Controller, Get } from '@nestjs/common';
import { ChampionsService } from './champions.service';
import { SeasonDto } from './dto/season.dto';

@Controller('champions')
export class ChampionsController {
  constructor(private readonly championsService: ChampionsService) {}

  @Get()
  async getChampions(): Promise<SeasonDto[]> {
    return this.championsService.getChampions();
  }
}
