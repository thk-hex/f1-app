import { Controller, Get, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CacheService } from './cache.service';

@ApiTags('Cache Management')
@Controller('cache')
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check cache health status' })
  @ApiResponse({ status: 200, description: 'Cache health status' })
  async checkHealth() {
    const isHealthy = await this.cacheService.isHealthy();
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      cache: 'redis',
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get cache statistics' })
  @ApiResponse({ status: 200, description: 'Cache statistics' })
  async getStats() {
    const stats = await this.cacheService.getStats();
    return {
      stats,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('champions')
  @ApiOperation({ summary: 'Clear champions cache' })
  @ApiResponse({ status: 200, description: 'Champions cache cleared' })
  async clearChampionsCache() {
    const key = this.cacheService.getChampionsKey();
    await this.cacheService.del(key);
    return {
      message: 'Champions cache cleared',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('race-winners/:year')
  @ApiOperation({ summary: 'Clear race winners cache for specific year' })
  @ApiParam({ name: 'year', description: 'Year to clear cache for' })
  @ApiResponse({ status: 200, description: 'Race winners cache cleared for year' })
  async clearRaceWinnersCache(@Param('year') year: string) {
    const key = this.cacheService.getRaceWinnersKey(parseInt(year));
    await this.cacheService.del(key);
    return {
      message: `Race winners cache cleared for year ${year}`,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('race-winners')
  @ApiOperation({ summary: 'Clear all race winners cache' })
  @ApiResponse({ status: 200, description: 'All race winners cache cleared' })
  async clearAllRaceWinnersCache() {
    await this.cacheService.delByPattern('race_winners');
    return {
      message: 'All race winners cache cleared',
      timestamp: new Date().toISOString(),
    };
  }
} 