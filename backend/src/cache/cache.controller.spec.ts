import { Test, TestingModule } from '@nestjs/testing';
import { CacheController } from './cache.controller';
import { CacheService } from './cache.service';

describe('CacheController', () => {
  let controller: CacheController;
  let mockCacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    mockCacheService = {
      isHealthy: jest.fn(),
      getStats: jest.fn(),
      getChampionsKey: jest.fn(),
      getRaceWinnersKey: jest.fn(),
      del: jest.fn(),
      delByPattern: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CacheController],
      providers: [
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    controller = module.get<CacheController>(CacheController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return cache health status when healthy', async () => {
      mockCacheService.isHealthy.mockResolvedValue(true);

      const result = await controller.checkHealth();

      expect(result).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        cache: 'redis',
      });
      expect(mockCacheService.isHealthy).toHaveBeenCalled();
    });

    it('should return unhealthy status when cache is down', async () => {
      mockCacheService.isHealthy.mockResolvedValue(false);

      const result = await controller.checkHealth();

      expect(result).toEqual({
        status: 'unhealthy',
        timestamp: expect.any(String),
        cache: 'redis',
      });
      expect(mockCacheService.isHealthy).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      const expectedStats = { keys: 10, memory: '1MB' };
      mockCacheService.getStats.mockResolvedValue(expectedStats);

      const result = await controller.getStats();

      expect(result).toEqual({
        stats: expectedStats,
        timestamp: expect.any(String),
      });
      expect(mockCacheService.getStats).toHaveBeenCalled();
    });
  });

  describe('clearChampionsCache', () => {
    it('should clear champions cache successfully', async () => {
      mockCacheService.getChampionsKey.mockReturnValue('champions');
      mockCacheService.del.mockResolvedValue();

      const result = await controller.clearChampionsCache();

      expect(result).toEqual({
        message: 'Champions cache cleared',
        timestamp: expect.any(String),
      });
      expect(mockCacheService.getChampionsKey).toHaveBeenCalled();
      expect(mockCacheService.del).toHaveBeenCalledWith('champions');
    });
  });

  describe('clearRaceWinnersCache', () => {
    it('should clear race winners cache for specific year', async () => {
      const year = '2023';
      const expectedKey = 'race_winners:2023';
      mockCacheService.getRaceWinnersKey.mockReturnValue(expectedKey);
      mockCacheService.del.mockResolvedValue();

      const result = await controller.clearRaceWinnersCache(year);

      expect(result).toEqual({
        message: `Race winners cache cleared for year ${year}`,
        timestamp: expect.any(String),
      });
      expect(mockCacheService.getRaceWinnersKey).toHaveBeenCalledWith(
        parseInt(year),
      );
      expect(mockCacheService.del).toHaveBeenCalledWith(expectedKey);
    });
  });

  describe('clearAllRaceWinnersCache', () => {
    it('should clear all race winners cache', async () => {
      mockCacheService.delByPattern.mockResolvedValue();

      const result = await controller.clearAllRaceWinnersCache();

      expect(result).toEqual({
        message: 'All race winners cache cleared',
        timestamp: expect.any(String),
      });
      expect(mockCacheService.delByPattern).toHaveBeenCalledWith(
        'race_winners',
      );
    });
  });
});
