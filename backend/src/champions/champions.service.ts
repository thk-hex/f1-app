import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ChampionsMapper } from './champions.mapper';
import { ChampionsRepository } from './champions.repository';
import { SeasonDto } from './dto/season.dto';
import { CacheService, CacheTTL } from '../cache/cache.service';
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
    private readonly cacheService: CacheService,
  ) {}

  async getChampions(forceRefresh: boolean = false): Promise<SeasonDto[]> {
    const cacheKey = this.cacheService.getChampionsKey();

    if (!forceRefresh) {
      const cachedChampions =
        await this.cacheService.get<SeasonDto[]>(cacheKey);
      if (cachedChampions) {
        console.log('Returning champions data from Redis cache');
        return cachedChampions;
      }

      const hasData = await this.championsRepository.hasChampionsData();
      if (hasData) {
        console.log(
          'Loading champions data from database and caching in Redis',
        );
        const dbChampions = await this.championsRepository.findAllChampions();

        await this.cacheService.set(cacheKey, dbChampions, CacheTTL.CHAMPIONS);

        return dbChampions;
      }
    }

    const logMessage = forceRefresh
      ? 'Force refresh: Fetching champions data from external API and updating database'
      : 'Fetching champions data from external API';
    console.log(logMessage);

    const baseUrl = this.configService.get<string>('BASE_URL');
    const startYear = this.configService.get<number>('GP_START_YEAR');

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
          apiUrl,
          { httpService: this.httpService },
        );
        const seasonDto = this.championsMapper.mapToSeasonDto(response);

        if (seasonDto && seasonDto.season) {
          await this.championsRepository.upsertChampion(seasonDto);
          return seasonDto;
        }
        return null;
      },
    );

    if (seasons.length > 0) {
      const orderedChampions =
        await this.championsRepository.findAllChampions();
      await this.cacheService.set(
        cacheKey,
        orderedChampions,
        CacheTTL.CHAMPIONS,
      );
      return orderedChampions;
    }

    return seasons;
  }
}
