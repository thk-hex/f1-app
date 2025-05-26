import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ChampionsMapper } from './champions.mapper';
import { SeasonDto } from './dto/season.dto';
import { PrismaService } from '../prisma/prisma.service';
import { F1ValidationUtil, HttpRateLimiterUtil } from '../shared/utils';

@Injectable()
export class ChampionsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly championsMapper: ChampionsMapper,
    private readonly prisma: PrismaService,
  ) {}

  private validateGpStartYear(startYear: number): void {
    F1ValidationUtil.validateGpStartYear(startYear, true);
  }

  async getChampions(): Promise<SeasonDto[]> {
    // First check if we already have data in the database
    const cachedChampions = await this.prisma.champion.findMany({
      orderBy: { season: 'asc' },
    });

    // If we have cached data, return it directly
    if (cachedChampions.length > 0) {
      return cachedChampions.map((champion) => ({
        season: champion.season,
        givenName: champion.givenName,
        familyName: champion.familyName,
        driverId: champion.driverId || '',
      }));
    }

    // If no cached data, fetch from API and store in database
    const baseUrl = this.configService.get<string>('BASE_URL');
    F1ValidationUtil.validateBaseUrl(baseUrl);

    const currentYear = new Date().getFullYear();
    const startYear = this.configService.get<number>('GP_START_YEAR') || 2005;

    // Validate GP_START_YEAR
    this.validateGpStartYear(startYear);

    const seasons: SeasonDto[] = [];

    // Process years sequentially with rate limiting
    for (let year = startYear; year <= currentYear; year++) {
      const apiUrl = `${baseUrl}/${year}/driverstandings/1.json`;

      try {
        const response = await HttpRateLimiterUtil.makeRateLimitedRequest(
          this.httpService,
          apiUrl,
        );
        const seasonDto = this.championsMapper.mapToSeasonDto(response);

        if (seasonDto && seasonDto.season) {
          // Add to our result array
          seasons.push(seasonDto);

          // Store in database
          await this.prisma.champion.upsert({
            where: { season: seasonDto.season },
            update: {
              givenName: seasonDto.givenName,
              familyName: seasonDto.familyName,
              driverId: seasonDto.driverId,
            },
            create: {
              season: seasonDto.season,
              givenName: seasonDto.givenName,
              familyName: seasonDto.familyName,
              driverId: seasonDto.driverId,
            },
          });
        }
      } catch (error) {
        console.error(
          `Error fetching champion standings for ${year}:`,
          error.message,
        );
        // Continue with the next year even if one fails
      }
    }

    return seasons;
  }
}
