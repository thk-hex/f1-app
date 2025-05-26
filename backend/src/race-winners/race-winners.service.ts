import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { RaceWinnersMapper } from './race-winners.mapper';
import { RaceDto } from './dto/race.dto';
import { PrismaService } from '../prisma/prisma.service';
import { F1ValidationUtil, HttpRateLimiterUtil } from '../shared/utils';

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
    });

    // If we have cached data, sort by round number and return it
    if (cachedRaces.length > 0) {
      const sortedRaces = cachedRaces.sort(
        (a, b) => parseInt(a.round) - parseInt(b.round),
      );

      return sortedRaces.map((race) => ({
        round: race.round,
        gpName: race.gpName,
        winnerId: race.winnerId,
        winnerGivenName: race.winnerGivenName,
        winnerFamilyName: race.winnerFamilyName,
      }));
    }

    // If no cached data, fetch from API and store in database
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

      // Store in database
      for (const raceDto of raceDtos) {
        await this.prisma.raceWinner.upsert({
          where: {
            season_round: {
              season: year.toString(),
              round: raceDto.round,
            },
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
}
