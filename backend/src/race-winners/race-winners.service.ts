import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { RaceWinnersMapper } from './race-winners.mapper';
import { RaceDto } from './dto/race.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService, CacheTTL } from '../cache/cache.service';
import { F1ValidationUtil, HttpRateLimiterUtil, SanitizationUtil } from '../shared/utils';

@Injectable()
export class RaceWinnersService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly raceWinnersMapper: RaceWinnersMapper,
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async getRaceWinners(year: number): Promise<RaceDto[]> {
    const cacheKey = this.cacheService.getRaceWinnersKey(year);

    // First check Redis cache
    const cachedRaceWinners = await this.cacheService.get<RaceDto[]>(cacheKey);
    if (cachedRaceWinners) {
      console.log(`Returning race winners for ${year} from Redis cache`);
      return cachedRaceWinners;
    }

    // Then check if we already have data in the database for this year
    const cachedRaces = await this.prisma.raceWinner.findMany({
      where: { season: year.toString() },
      include: {
        driver: true,
      },
    });

    // If we have cached data, sort by round number and return it
    if (cachedRaces.length > 0) {
      console.log(
        `Loading race winners for ${year} from database and caching in Redis`,
      );
      const sortedRaces = cachedRaces.sort(
        (a, b) => parseInt(a.round) - parseInt(b.round),
      );

      const raceResults = sortedRaces.map((race) => ({
        round: race.round,
        gpName: race.gpName,
        winnerId: race.driver.driverId,
        winnerGivenName: race.driver.givenName,
        winnerFamilyName: race.driver.familyName,
      }));

      // Cache the database result in Redis for faster future access
      await this.cacheService.set(cacheKey, raceResults, CacheTTL.RACE_WINNERS);

      return raceResults;
    }

    // If no cached data, fetch from API and store in database
    console.log(`Fetching race winners for ${year} from external API`);
    const baseUrl = this.configService.get<string>('BASE_URL');
    F1ValidationUtil.validateBaseUrl(baseUrl);

    const apiUrl = `${baseUrl}/${year}/results/1.json`;

    try {
      const response = await HttpRateLimiterUtil.makeRateLimitedRequest(
        this.httpService,
        apiUrl,
      );
      const raceDtos = this.raceWinnersMapper.mapToRaceDtos(response);

      // Sort by round number for consistent ordering
      raceDtos.sort((a, b) => parseInt(a.round) - parseInt(b.round));

      // Store in database with sanitization
      for (const raceDto of raceDtos) {
        // Sanitize all race data before database operations
        const sanitizedRaceData = {
          round: SanitizationUtil.sanitizeString(raceDto.round, { maxLength: 2, trimWhitespace: true }),
          gpName: SanitizationUtil.sanitizeString(raceDto.gpName, { maxLength: 100, trimWhitespace: true }),
          winnerId: SanitizationUtil.sanitizeIdentifier(raceDto.winnerId),
          winnerGivenName: SanitizationUtil.sanitizeString(raceDto.winnerGivenName, { maxLength: 50, trimWhitespace: true }),
          winnerFamilyName: SanitizationUtil.sanitizeString(raceDto.winnerFamilyName, { maxLength: 50, trimWhitespace: true }),
        };

        // Validate sanitized data
        const validation = SanitizationUtil.validateTextContent(
          `${sanitizedRaceData.round} ${sanitizedRaceData.gpName} ${sanitizedRaceData.winnerId} ${sanitizedRaceData.winnerGivenName} ${sanitizedRaceData.winnerFamilyName}`
        );
        
        if (!validation.isValid) {
          console.warn(`Skipping race data for round ${sanitizedRaceData.round} due to validation issues: ${validation.issues.join(', ')}`);
          continue;
        }

        await this.prisma.driver.upsert({
          where: { driverId: sanitizedRaceData.winnerId },
          update: {
            givenName: sanitizedRaceData.winnerGivenName,
            familyName: sanitizedRaceData.winnerFamilyName,
          },
          create: {
            driverId: sanitizedRaceData.winnerId,
            givenName: sanitizedRaceData.winnerGivenName,
            familyName: sanitizedRaceData.winnerFamilyName,
          },
        });

        await this.prisma.raceWinner.upsert({
          where: {
            season_round: {
              season: year.toString(),
              round: sanitizedRaceData.round,
            },
          },
          update: {
            gpName: sanitizedRaceData.gpName,
            driverId: sanitizedRaceData.winnerId,
          },
          create: {
            season: year.toString(),
            round: sanitizedRaceData.round,
            gpName: sanitizedRaceData.gpName,
            driverId: sanitizedRaceData.winnerId,
          },
        });
      }

      // Cache the API result in Redis
      if (raceDtos.length > 0) {
        await this.cacheService.set(cacheKey, raceDtos, CacheTTL.RACE_WINNERS);
      }

      return raceDtos;
    } catch (error) {
      console.error(`Error fetching race winners for ${year}:`, error.message);
      throw error;
    }
  }
}
