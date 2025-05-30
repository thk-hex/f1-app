import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SeasonDto } from './dto/season.dto';
import { SanitizationUtil } from '../shared/utils/sanitization.util';

export interface ChampionData {
  season: string;
  givenName: string;
  familyName: string;
  driverId: string;
}

@Injectable()
export class ChampionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllChampions(): Promise<SeasonDto[]> {
    const champions = await this.prisma.champion.findMany({
      include: {
        driver: true,
      },
      orderBy: { season: 'asc' },
    });

    return champions.map((champion) => ({
      season: champion.season,
      givenName: champion.driver.givenName,
      familyName: champion.driver.familyName,
      driverId: champion.driver.driverId,
    }));
  }

  async upsertChampion(championData: ChampionData): Promise<void> {
    // Sanitize all input data before database operations
    const sanitizedData = {
      season: SanitizationUtil.sanitizeString(championData.season, { maxLength: 4, trimWhitespace: true }),
      givenName: SanitizationUtil.sanitizeString(championData.givenName, { maxLength: 50, trimWhitespace: true }),
      familyName: SanitizationUtil.sanitizeString(championData.familyName, { maxLength: 50, trimWhitespace: true }),
      driverId: SanitizationUtil.sanitizeIdentifier(championData.driverId),
    };

    // Validate sanitized data
    const validation = SanitizationUtil.validateTextContent(
      `${sanitizedData.season} ${sanitizedData.givenName} ${sanitizedData.familyName} ${sanitizedData.driverId}`
    );
    
    if (!validation.isValid) {
      console.warn(`Skipping champion data due to validation issues: ${validation.issues.join(', ')}`);
      return;
    }

    await this.prisma.driver.upsert({
      where: { driverId: sanitizedData.driverId },
      update: {
        givenName: sanitizedData.givenName,
        familyName: sanitizedData.familyName,
      },
      create: {
        driverId: sanitizedData.driverId,
        givenName: sanitizedData.givenName,
        familyName: sanitizedData.familyName,
      },
    });

    await this.prisma.champion.upsert({
      where: { season: sanitizedData.season },
      update: {
        driverId: sanitizedData.driverId,
      },
      create: {
        season: sanitizedData.season,
        driverId: sanitizedData.driverId,
      },
    });
  }

  async hasChampionsData(): Promise<boolean> {
    const count = await this.prisma.champion.count();
    return count > 0;
  }
}
