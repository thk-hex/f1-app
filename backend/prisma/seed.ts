import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { F1ValidationUtil, HttpRateLimiterUtil } from '../src/shared/utils';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();





// Function to map API response to Champion data
function mapToChampion(data: any): { season: string; givenName: string; familyName: string; driverId: string } | null {
  if (!data.MRData?.StandingsTable?.season) {
    return null;
  }
  
  return {
    season: data.MRData?.StandingsTable?.season || '',
    givenName:
      data.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0]
        ?.Driver?.givenName || '',
    familyName:
      data.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0]
        ?.Driver?.familyName || '',
    driverId:
      data.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0]
        ?.Driver?.driverId || '',
  };
}

async function main() {
  console.log('Starting seed...');
  
  // Check if we have the required environment variables
  const baseUrl = process.env.BASE_URL;
  F1ValidationUtil.validateBaseUrl(baseUrl);
  
  const currentYear = new Date().getFullYear();
  const startYear = process.env.GP_START_YEAR ? parseInt(process.env.GP_START_YEAR, 10) : 2005;
  
  F1ValidationUtil.validateGpStartYear(startYear);
  
  console.log(`Fetching champions from ${startYear} to ${currentYear}...`);
  
  // Process years sequentially with rate limiting
  for (let year = startYear; year <= currentYear; year++) {
    const apiUrl = `${baseUrl}/${year}/driverstandings/1.json`;
    
    try {
      console.log(`Fetching champion for ${year}...`);
      const response = await HttpRateLimiterUtil.makeRateLimitedRequestWithAxios(apiUrl);
      const champion = mapToChampion(response);
      
      if (champion && champion.season) {
        console.log(`Upserting champion for season ${champion.season}: ${champion.givenName} ${champion.familyName} (${champion.driverId})`);
        
        // Store in database
        await prisma.champion.upsert({
          where: { season: champion.season },
          update: {
            givenName: champion.givenName,
            familyName: champion.familyName,
            driverId: champion.driverId,
          },
          create: {
            season: champion.season,
            givenName: champion.givenName,
            familyName: champion.familyName,
            driverId: champion.driverId,
          },
        });
      }
    } catch (error) {
      console.error(`Error fetching champion standings for ${year}:`, error.message);
      // Continue with the next year even if one fails
    }
  }
  
  console.log('Seed completed successfully!');
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