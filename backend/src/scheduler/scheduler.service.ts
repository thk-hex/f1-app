import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ChampionsService } from '../champions/champions.service';
import { RaceWinnersService } from '../race-winners/race-winners.service';
import { CacheService } from '../cache/cache.service';
import { F1ValidationUtil } from '../shared/utils/f1-validation.util';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly championsService: ChampionsService,
    private readonly raceWinnersService: RaceWinnersService,
    private readonly cacheService: CacheService,
  ) {}

  // Run every Monday at 12:00 PM UTC (0 12 * * 1)
  @Cron('0 12 * * 1', {
    name: 'updateF1Data',
    timeZone: 'UTC',
  })
  async handleWeeklyDataUpdate() {
    this.logger.log('Starting weekly F1 data update job...');

    try {
      await this.clearAllCache();

      await this.updateChampionsData();

      await this.updateRaceWinnersData();

      this.logger.log('Weekly F1 data update completed successfully');
    } catch (error) {
      this.logger.error('Weekly F1 data update failed:', error.message);
      this.logger.error(error.stack);
    }
  }

  async triggerManualUpdate(): Promise<void> {
    this.logger.log('Manual F1 data update triggered...');
    await this.handleWeeklyDataUpdate();
  }

  private async clearAllCache(): Promise<void> {
    try {
      this.logger.log('Clearing cache before data update...');

      const championsKey = this.cacheService.getChampionsKey();
      await this.cacheService.del(championsKey);

      const currentYear = new Date().getFullYear();
      const startYear = this.configService.get<number>('GP_START_YEAR', 2005);

      for (let year = startYear; year <= currentYear; year++) {
        const raceWinnersKey = this.cacheService.getRaceWinnersKey(year);
        await this.cacheService.del(raceWinnersKey);
      }

      this.logger.log('Cache cleared successfully');
    } catch (error) {
      this.logger.warn('Failed to clear cache:', error.message);
    }
  }

  private async updateChampionsData(): Promise<void> {
    try {
      this.logger.log('Updating champions data...');

      const champions = await this.championsService.getChampions(true);

      this.logger.log(
        `Successfully updated ${champions.length} champions records`,
      );
    } catch (error) {
      this.logger.error('Failed to update champions data:', error.message);
      throw error;
    }
  }

  private async updateRaceWinnersData(): Promise<void> {
    try {
      this.logger.log('Updating race winners data...');

      const currentYear = new Date().getFullYear();
      const startYear = Math.max(
        this.configService.get<number>('GP_START_YEAR', 2005),
        currentYear, // Only update last year
      );

      F1ValidationUtil.validateGpStartYear(startYear);

      let totalRacesUpdated = 0;

      for (let year = startYear; year <= currentYear; year++) {
        try {
          this.logger.log(`Updating race winners for year ${year}...`);

          const raceWinners = await this.raceWinnersService.getRaceWinners(
            year,
            true,
          );

          totalRacesUpdated += raceWinners.length;
          this.logger.log(
            `Updated ${raceWinners.length} race winners for year ${year}`,
          );

          await this.delay(500);
        } catch (error) {
          this.logger.error(
            `Failed to update race winners for year ${year}:`,
            error.message,
          );
        }
      }

      this.logger.log(
        `Successfully updated race winners data. Total races: ${totalRacesUpdated}`,
      );
    } catch (error) {
      this.logger.error('Failed to update race winners data:', error.message);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getNextScheduledRun(): Date {
    const now = new Date();
    const nextMonday = new Date(now);

    const daysUntilNextMonday = (1 + 7 - now.getUTCDay()) % 7;
    nextMonday.setUTCDate(
      now.getUTCDate() + (daysUntilNextMonday === 0 ? 7 : daysUntilNextMonday),
    );
    nextMonday.setUTCHours(12, 0, 0, 0);

    if (now.getUTCDay() === 1 && now.getUTCHours() >= 12) {
      nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
    }

    return nextMonday;
  }
}
