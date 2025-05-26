import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { RaceWinnersMapper } from './race-winners.mapper';
import { RaceDto } from './dto/race.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RaceWinnersService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly raceWinnersMapper: RaceWinnersMapper,
    private readonly prisma: PrismaService,
  ) {}

  async getRaceWinners(year: number): Promise<RaceDto[]> {
    // First check if we already have data in the database for this year
    const cachedRaces = await this.prisma.raceWinner.findMany({
      where: { season: year.toString() },
      orderBy: { round: 'asc' },
    });

    // If we have cached data, return it directly
    if (cachedRaces.length > 0) {
      return cachedRaces.map(race => ({
        round: race.round,
        gpName: race.gpName,
        winnerId: race.winnerId,
        winnerGivenName: race.winnerGivenName,
        winnerFamilyName: race.winnerFamilyName,
      }));
    }

    // If no cached data, fetch from API and store in database
    const baseUrl = this.configService.get<string>('BASE_URL');
    if (!baseUrl) {
      throw new Error('BASE_URL not configured in .env file');
    }

    const apiUrl = `${baseUrl}/${year}/results/1.json`;
    
    try {
      const response = await this.makeRateLimitedRequest(apiUrl);
      const raceDtos = this.raceWinnersMapper.mapToRaceDtos(response);
      
      // Store in database
      for (const raceDto of raceDtos) {
        await this.prisma.raceWinner.upsert({
          where: { 
            season_round: {
              season: year.toString(),
              round: raceDto.round,
            }
          },
          update: {
            gpName: raceDto.gpName,
            winnerId: raceDto.winnerId,
            winnerGivenName: raceDto.winnerGivenName,
            winnerFamilyName: raceDto.winnerFamilyName,
          },
          create: {
            season: year.toString(),
            round: raceDto.round,
            gpName: raceDto.gpName,
            winnerId: raceDto.winnerId,
            winnerGivenName: raceDto.winnerGivenName,
            winnerFamilyName: raceDto.winnerFamilyName,
          },
        });
      }

      return raceDtos;
    } catch (error) {
      console.error(`Error fetching race winners for ${year}:`, error.message);
      throw error;
    }
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
