import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SeasonDto } from './dto/season.dto';

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
      orderBy: { season: 'desc' },
    });

    return champions.map((champion) => ({
      season: champion.season,
      givenName: champion.driver.givenName,
      familyName: champion.driver.familyName,
      driverId: champion.driver.driverId,
    }));
  }

  async upsertChampion(championData: ChampionData): Promise<void> {
    await this.prisma.driver.upsert({
      where: { driverId: championData.driverId },
      update: {
        givenName: championData.givenName,
        familyName: championData.familyName,
      },
      create: {
        driverId: championData.driverId,
        givenName: championData.givenName,
        familyName: championData.familyName,
      },
    });

    await this.prisma.champion.upsert({
      where: { season: championData.season },
      update: {
        driverId: championData.driverId,
      },
      create: {
        season: championData.season,
        driverId: championData.driverId,
      },
    });
  }

  async hasChampionsData(): Promise<boolean> {
    const count = await this.prisma.champion.count();
    return count > 0;
  }
}
