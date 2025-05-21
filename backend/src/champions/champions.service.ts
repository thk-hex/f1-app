import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChampionsMapper } from './champions.mapper';
import { SeasonDto } from './dto/season.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChampionsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly championsMapper: ChampionsMapper,
    private readonly prisma: PrismaService,
  ) {}

  async getChampions(): Promise<SeasonDto[]> {
    // First check if we already have data in the database
    const cachedChampions = await this.prisma.champion.findMany({
      orderBy: { season: 'asc' },
    });

    // If we have cached data, return it directly
    if (cachedChampions.length > 0) {
      return cachedChampions.map(champion => ({
        season: champion.season,
        givenName: champion.givenName,
        familyName: champion.familyName,
      }));
    }

    // If no cached data, fetch from API and store in database
    const baseUrl = this.configService.get<string>('BASE_URL');
    if (!baseUrl) {
      throw new Error('BASE_URL not configured in .env file');
    }

    const currentYear = new Date().getFullYear();
    const startYear = this.configService.get<number>('GP_START_YEAR') || 2005;
    const seasons: SeasonDto[] = [];

    // Process years sequentially with rate limiting
    for (let year = startYear; year <= currentYear; year++) {
      const apiUrl = `${baseUrl}/${year}/driverstandings/1.json`;
      
      try {
        const response = await this.makeRateLimitedRequest(apiUrl);
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
            },
            create: {
              season: seasonDto.season,
              givenName: seasonDto.givenName,
              familyName: seasonDto.familyName,
            },
          });
        }
      } catch (error) {
        console.error(`Error fetching champion standings for ${year}:`, error.message);
        // Continue with the next year even if one fails
      }
    }

    return seasons;
  }

  private async makeRateLimitedRequest(url: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(url)
      );
      
      const data = response.data;
      const headers = response.headers;

      // Check if there's a rate limit header indicating when we can make the next request
      const retryAfter = headers['retry-after'] || headers['x-ratelimit-reset'];
      
      if (retryAfter) {
        // If header exists, wait for the specified time
        const waitTimeMs = parseInt(retryAfter, 10) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTimeMs));
      } else {
        // Default rate limiting: 4 requests per second = 250ms between requests
        await new Promise(resolve => setTimeout(resolve, 250));
      }

      return data;
    } catch (error) {
      // If we hit a rate limit, wait and try again
      if (error.response && error.response.status === 429) {
        const retryAfter = error.response.headers['retry-after'] || error.response.headers['x-ratelimit-reset'] || 1;
        const waitTimeMs = parseInt(retryAfter, 10) * 1000;
        
        console.log(`Rate limit hit, waiting for ${waitTimeMs}ms before retrying...`);
        await new Promise(resolve => setTimeout(resolve, waitTimeMs));
        
        // Retry the request after waiting
        return this.makeRateLimitedRequest(url);
      }
      
      throw error;
    }
  }
}
