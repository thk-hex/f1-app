import * as dotenv from 'dotenv';
import { F1ValidationUtil, HttpRateLimiterUtil, F1DataProcessorUtil } from '../src/shared/utils';
import { ChampionsMapper } from '../src/champions/champions.mapper';
import { ChampionsRepository } from '../src/champions/champions.repository';
import { PrismaService } from '../src/prisma/prisma.service';

// Load environment variables
dotenv.config();

// Create instances of the services to reuse existing logic
const prismaService = new PrismaService();
const championsMapper = new ChampionsMapper();
const championsRepository = new ChampionsRepository(prismaService);

async function main() {
  console.log('Starting seed...');
  
  const baseUrl = process.env.BASE_URL;
  const startYear = process.env.GP_START_YEAR ? parseInt(process.env.GP_START_YEAR, 10) : 2005;
  
  // Validate configuration
  F1ValidationUtil.validateBaseUrl(baseUrl);
  F1ValidationUtil.validateGpStartYear(startYear);
  
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
      const championDto = championsMapper.mapToSeasonDto(response);
      
      if (championDto && championDto.season) {
        console.log(`Upserting champion for season ${championDto.season}: ${championDto.givenName} ${championDto.familyName} (${championDto.driverId})`);
        
        // Store in database using repository
        await championsRepository.upsertChampion(championDto);
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
    await prismaService.$disconnect();
  }); 