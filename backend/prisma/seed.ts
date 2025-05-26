import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { plainToInstance } from 'class-transformer';
import { F1ValidationUtil, HttpRateLimiterUtil, F1DataProcessorUtil } from '../src/shared/utils';
import { SeasonDto } from '../src/champions/dto/season.dto';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

// Standalone mapper function (replicates ChampionsMapper logic)
function mapToSeasonDto(data: any): SeasonDto {
  const dto = new SeasonDto();
  dto.season = data.MRData?.StandingsTable?.season || '';
  dto.givenName =
    data.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0]
      ?.Driver?.givenName || '';
  dto.familyName =
    data.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0]
      ?.Driver?.familyName || '';
  dto.driverId =
    data.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0]
      ?.Driver?.driverId || '';

  // Use class-transformer to ensure proper instance creation
  return plainToInstance(SeasonDto, dto, { excludeExtraneousValues: true });
}

// Standalone repository function (replicates ChampionsRepository logic)
async function upsertChampion(championData: SeasonDto): Promise<void> {
  await prisma.champion.upsert({
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

async function main() {
  console.log('Starting seed...');
  
  const baseUrl = process.env.BASE_URL;
  const startYear = process.env.GP_START_YEAR ? parseInt(process.env.GP_START_YEAR, 10) : 2005;
  
  const { endYear } = F1DataProcessorUtil.getYearRange(startYear);
  console.log(`Fetching champions from ${startYear} to ${endYear}...`);
  
  const champions = await F1DataProcessorUtil.processYearsSequentially(
    {
      baseUrl,
      startYear,
      onProgress: (year, total, current) => {
        console.log(`Fetching champion for ${year}... (${current}/${total})`);
      },
      onError: (year, error) => {
        console.error(`Error fetching champion standings for ${year}:`, error.message);
      },
    },
    async (year, apiUrl) => {
      const response = await HttpRateLimiterUtil.makeRateLimitedRequestWithAxios(apiUrl);
      const championDto = mapToSeasonDto(response);
      
      if (championDto && championDto.season) {
        console.log(`Upserting champion for season ${championDto.season}: ${championDto.givenName} ${championDto.familyName} (${championDto.driverId})`);
        
        // Store in database
        await upsertChampion(championDto);
        return championDto;
      }
      return null;
    },
  );
  
  console.log(`Seed completed successfully! Processed ${champions.length} champions.`);
}

// Execute the seed
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 