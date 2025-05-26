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
      orderBy: { season: 'asc' },
    });

    return champions.map((champion) => ({
      season: champion.season,
      givenName: champion.givenName,
      familyName: champion.familyName,
      driverId: champion.driverId || '',
    }));
  }

  async upsertChampion(championData: ChampionData): Promise<void> {
    await this.prisma.champion.upsert({
      where: { season: championData.season },
      update: {
        givenName: championData.givenName,
        familyName: championData.familyName,
        driverId: championData.driverId,
      },
      create: {
        season: championData.season,
        givenName: championData.givenName,
        familyName: championData.familyName,
        driverId: championData.driverId,
      },
    });
  }

  async hasChampionsData(): Promise<boolean> {
    const count = await this.prisma.champion.count();
    return count > 0;
  }
}
