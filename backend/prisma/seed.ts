import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function makeRateLimitedRequest(url: string): Promise<any> {
  try {
    const response = await axios.get(url);
    
    // Default rate limiting: 4 requests per second = 250ms between requests
    await new Promise(resolve => setTimeout(resolve, 250));

    return response.data;
  } catch (error) {
    // If we hit a rate limit, wait and try again
    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || error.response.headers['x-ratelimit-reset'] || 1;
      const waitTimeMs = parseInt(retryAfter, 10) * 1000;
      
      console.log(`Rate limit hit, waiting for ${waitTimeMs}ms before retrying...`);
      await new Promise(resolve => setTimeout(resolve, waitTimeMs));
      
      // Retry the request after waiting
      return makeRateLimitedRequest(url);
    }
    
    throw error;
  }
}

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
  if (!baseUrl) {
    throw new Error('BASE_URL not configured in .env file');
  }
  
  const currentYear = new Date().getFullYear();
  const startYear = process.env.GP_START_YEAR ? parseInt(process.env.GP_START_YEAR, 10) : 2005;
  
  console.log(`Fetching champions from ${startYear} to ${currentYear}...`);
  
  // Process years sequentially with rate limiting
  for (let year = startYear; year <= currentYear; year++) {
    const apiUrl = `${baseUrl}/${year}/driverstandings/1.json`;
    
    try {
      console.log(`Fetching champion for ${year}...`);
      const response = await makeRateLimitedRequest(apiUrl);
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