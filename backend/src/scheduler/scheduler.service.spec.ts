import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { ChampionsService } from '../champions/champions.service';
import { RaceWinnersService } from '../race-winners/race-winners.service';
import { CacheService } from '../cache/cache.service';

describe('SchedulerService', () => {
  let service: SchedulerService;
  let mockChampionsService: jest.Mocked<ChampionsService>;
  let mockRaceWinnersService: jest.Mocked<RaceWinnersService>;
  let mockCacheService: jest.Mocked<CacheService>;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    // Create mock services
    mockChampionsService = {
      getChampions: jest.fn(),
    } as any;

    mockRaceWinnersService = {
      getRaceWinners: jest.fn(),
    } as any;

    mockCacheService = {
      getChampionsKey: jest.fn().mockReturnValue('champions'),
      getRaceWinnersKey: jest
        .fn()
        .mockImplementation((year) => `race_winners:${year}`),
      del: jest.fn(),
    } as any;

    mockConfigService = {
      get: jest.fn().mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'GP_START_YEAR') return 2005;
        return defaultValue;
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: ChampionsService,
          useValue: mockChampionsService,
        },
        {
          provide: RaceWinnersService,
          useValue: mockRaceWinnersService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<SchedulerService>(SchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate next Monday correctly', () => {
    const nextRun = service.getNextScheduledRun();
    expect(nextRun).toBeInstanceOf(Date);
    expect(nextRun.getUTCDay()).toBe(1); // Monday
    expect(nextRun.getUTCHours()).toBe(12); // 12 PM
    expect(nextRun.getUTCMinutes()).toBe(0);
    expect(nextRun.getUTCSeconds()).toBe(0);
  });

  it('should trigger manual update', async () => {
    // Mock successful responses
    mockChampionsService.getChampions.mockResolvedValue([]);
    mockRaceWinnersService.getRaceWinners.mockResolvedValue([]);
    mockCacheService.del.mockResolvedValue();

    await service.triggerManualUpdate();

    expect(mockCacheService.del).toHaveBeenCalled();
    expect(mockChampionsService.getChampions).toHaveBeenCalledWith(true);
    expect(mockRaceWinnersService.getRaceWinners).toHaveBeenCalledWith(
      expect.any(Number),
      true,
    );
  });

  it('should handle errors gracefully during update', async () => {
    const loggerErrorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
    const loggerLogSpy = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => {});

    mockChampionsService.getChampions.mockRejectedValue(new Error('API Error'));
    mockCacheService.del.mockResolvedValue();

    await expect(service.triggerManualUpdate()).resolves.toBeUndefined();

    expect(mockCacheService.del).toHaveBeenCalled();
    expect(mockChampionsService.getChampions).toHaveBeenCalledWith(true);

    loggerErrorSpy.mockRestore();
    loggerLogSpy.mockRestore();
  });
});
