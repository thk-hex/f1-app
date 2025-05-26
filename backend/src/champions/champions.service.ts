import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ChampionsMapper } from './champions.mapper';
import { ChampionsRepository } from './champions.repository';
import { SeasonDto } from './dto/season.dto';
import {
  F1ValidationUtil,
  HttpRateLimiterUtil,
  F1DataProcessorUtil,
} from '../shared/utils';

@Injectable()
export class ChampionsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly championsMapper: ChampionsMapper,
    private readonly championsRepository: ChampionsRepository,
  ) {}

  async getChampions(): Promise<SeasonDto[]> {
    // First check if we already have data in the database
    const hasData = await this.championsRepository.hasChampionsData();
    if (hasData) {
      return this.championsRepository.findAllChampions();
    }

    // If no cached data, fetch from API and store in database
    const baseUrl = this.configService.get<string>('BASE_URL');
    const startYear = this.configService.get<number>('GP_START_YEAR') || 2005;

    // Validate GP_START_YEAR
    F1ValidationUtil.validateGpStartYear(startYear, true);

    const seasons = await F1DataProcessorUtil.processYearsSequentially(
      {
        baseUrl,
        startYear,
        onError: (year, error) => {
          console.error(
            `Error fetching champion standings for ${year}:`,
            error.message,
          );
        },
      },
      async (year, apiUrl) => {
        const response = await HttpRateLimiterUtil.makeRateLimitedRequest(
          this.httpService,
          apiUrl,
        );
        const seasonDto = this.championsMapper.mapToSeasonDto(response);

        if (seasonDto && seasonDto.season) {
          // Store in database
          await this.championsRepository.upsertChampion(seasonDto);
          return seasonDto;
        }
        return null;
      },
    );

    return seasons;
  }
}
