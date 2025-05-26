import { Test, TestingModule } from '@nestjs/testing';
import { ChampionsService } from './champions.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ChampionsMapper } from './champions.mapper';
import { ChampionsRepository } from './champions.repository';
import { SeasonDto } from './dto/season.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { TestUtils } from '../shared/utils';
import { CacheService } from '../cache/cache.service';

describe('ChampionsService', () => {
  let service: ChampionsService;
  let httpService: HttpService;
  let configService: ConfigService;
  let mapper: ChampionsMapper;
  let repository: ChampionsRepository;
  let cacheService: CacheService;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChampionsService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'GP_START_YEAR') return 2005;
              return undefined;
            }),
          },
        },
        {
          provide: ChampionsMapper,
          useValue: {
            mapToSeasonDto: jest.fn(),
          },
        },
        {
          provide: ChampionsRepository,
          useValue: {
            findAllChampions: jest.fn(),
            hasChampionsData: jest.fn(),
            upsertChampion: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            champion: {
              findMany: jest.fn(),
              upsert: jest.fn(),
            },
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            getChampionsKey: jest.fn().mockReturnValue('champions'),
          },
        },
      ],
    }).compile();

    service = module.get<ChampionsService>(ChampionsService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    mapper = module.get<ChampionsMapper>(ChampionsMapper);
    repository = module.get<ChampionsRepository>(ChampionsRepository);
    cacheService = module.get<CacheService>(CacheService);

    // Mock console methods to prevent them from showing in test output
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Mock Date.getFullYear to return a consistent value
    jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2006);
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
    consoleLogSpy?.mockRestore();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getChampions', () => {
    it('should return cached champions if they exist in the database', async () => {
      const mockCachedChampions = [
        {
          season: '2005',
          givenName: 'Fernando',
          familyName: 'Alonso',
          driverId: 'alonso',
        },
        {
          season: '2006',
          givenName: 'Michael',
          familyName: 'Schumacher',
          driverId: 'schumacher',
        },
      ];

      (repository.hasChampionsData as jest.Mock).mockResolvedValue(true);
      (repository.findAllChampions as jest.Mock).mockResolvedValue(
        mockCachedChampions,
      );

      const result = await service.getChampions();

      expect(repository.hasChampionsData).toHaveBeenCalled();
      expect(repository.findAllChampions).toHaveBeenCalled();
      expect(httpService.get).not.toHaveBeenCalled(); // API should not be called when cache exists
      expect(result).toEqual([
        {
          season: '2005',
          givenName: 'Fernando',
          familyName: 'Alonso',
          driverId: 'alonso',
        },
        {
          season: '2006',
          givenName: 'Michael',
          familyName: 'Schumacher',
          driverId: 'schumacher',
        },
      ]);
    });

    it('should handle cached champions with missing driverId', async () => {
      const mockCachedChampions = [
        {
          season: '2005',
          givenName: 'Fernando',
          familyName: 'Alonso',
          driverId: '', // Simulate missing driverId (repository returns empty string)
        },
      ];

      (repository.hasChampionsData as jest.Mock).mockResolvedValue(true);
      (repository.findAllChampions as jest.Mock).mockResolvedValue(
        mockCachedChampions,
      );

      const result = await service.getChampions();

      expect(result).toEqual([
        {
          season: '2005',
          givenName: 'Fernando',
          familyName: 'Alonso',
          driverId: '',
        },
      ]);
    });

    it('should fetch from API and store in database if no cached champions exist', async () => {
      // Mock empty database
      (repository.hasChampionsData as jest.Mock).mockResolvedValue(false);

      const baseUrl = 'https://api.jolpi.ca/ergast/f1';
      (configService.get as jest.Mock).mockImplementation((key) => {
        if (key === 'BASE_URL') return baseUrl;
        if (key === 'GP_START_YEAR') return 2005;
        return undefined;
      });

      const mockData2005 = { MRData: { StandingsTable: { season: '2005' } } };
      const mockData2006 = { MRData: { StandingsTable: { season: '2006' } } };
      const mockDto2005 = new SeasonDto();
      mockDto2005.season = '2005';
      mockDto2005.givenName = 'Fernando';
      mockDto2005.familyName = 'Alonso';
      mockDto2005.driverId = 'alonso';

      const mockDto2006 = new SeasonDto();
      mockDto2006.season = '2006';
      mockDto2006.givenName = 'Michael';
      mockDto2006.familyName = 'Schumacher';
      mockDto2006.driverId = 'schumacher';

      // Mock the shared utility method
      const makeRateLimitedRequestSpy = TestUtils.mockHttpRateLimiterRequest(
        (httpService, url: string) => {
          if (url.includes('2005')) return Promise.resolve(mockData2005);
          if (url.includes('2006')) return Promise.resolve(mockData2006);
          return Promise.resolve({});
        },
      );

      // Configure mapper mock to return appropriate DTO based on input
      (mapper.mapToSeasonDto as jest.Mock).mockImplementation((data) => {
        if (data === mockData2005) return mockDto2005;
        if (data === mockData2006) return mockDto2006;
        return new SeasonDto();
      });

      (repository.upsertChampion as jest.Mock).mockResolvedValue({}); // Mock successful database upsert

      const result = await service.getChampions();

      // Verify correct interactions
      expect(repository.hasChampionsData).toHaveBeenCalledTimes(1);
      expect(makeRateLimitedRequestSpy).toHaveBeenCalledWith(
        httpService,
        `${baseUrl}/2005/driverstandings/1.json`,
      );
      expect(makeRateLimitedRequestSpy).toHaveBeenCalledWith(
        httpService,
        `${baseUrl}/2006/driverstandings/1.json`,
      );

      // Verify that data was stored in the database with driverId
      expect(repository.upsertChampion).toHaveBeenCalledWith({
        season: '2005',
        givenName: 'Fernando',
        familyName: 'Alonso',
        driverId: 'alonso',
      });

      expect(repository.upsertChampion).toHaveBeenCalledWith({
        season: '2006',
        givenName: 'Michael',
        familyName: 'Schumacher',
        driverId: 'schumacher',
      });

      // Verify the result
      expect(result).toContainEqual(mockDto2005);
      expect(result).toContainEqual(mockDto2006);
    });

    it('should throw an error if BASE_URL is not configured', async () => {
      (repository.hasChampionsData as jest.Mock).mockResolvedValue(false);
      (configService.get as jest.Mock).mockImplementation((key) => {
        if (key === 'GP_START_YEAR') return 2005;
        return undefined;
      });

      await expect(service.getChampions()).rejects.toThrow(
        'BASE_URL not configured in .env file',
      );
    });

    it('should continue processing years even if one request fails', async () => {
      // Mock empty database
      (repository.hasChampionsData as jest.Mock).mockResolvedValue(false);

      const baseUrl = 'https://api.jolpi.ca/ergast/f1';
      (configService.get as jest.Mock).mockImplementation((key) => {
        if (key === 'BASE_URL') return baseUrl;
        if (key === 'GP_START_YEAR') return 2005;
        return undefined;
      });

      const mockData2006 = { MRData: { StandingsTable: { season: '2006' } } };
      const mockDto2006 = new SeasonDto();
      mockDto2006.season = '2006';
      mockDto2006.givenName = 'Michael';
      mockDto2006.familyName = 'Schumacher';
      mockDto2006.driverId = 'schumacher';

      // Mock the shared utility method with proper error/success behavior
      TestUtils.mockHttpRateLimiterRequest((httpService, url: string) => {
        if (url.includes('2005')) {
          return Promise.reject(new Error('API error for 2005'));
        }
        if (url.includes('2006')) {
          return Promise.resolve(mockData2006);
        }
        return Promise.resolve({});
      });

      (mapper.mapToSeasonDto as jest.Mock).mockReturnValue(mockDto2006);
      (repository.upsertChampion as jest.Mock).mockResolvedValue({});

      const result = await service.getChampions();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching champion standings for 2005:',
        'API error for 2005',
      );

      // Verify the database operation was called for the successful request with driverId
      expect(repository.upsertChampion).toHaveBeenCalledWith({
        season: '2006',
        givenName: 'Michael',
        familyName: 'Schumacher',
        driverId: 'schumacher',
      });

      // We should have at least the 2006 result in our array
      expect(result).toContainEqual(mockDto2006);
    });

    it('should handle empty season data from mapper', async () => {
      // Mock empty database
      (repository.hasChampionsData as jest.Mock).mockResolvedValue(false);

      const baseUrl = 'https://api.jolpi.ca/ergast/f1';
      (configService.get as jest.Mock).mockImplementation((key) => {
        if (key === 'BASE_URL') return baseUrl;
        if (key === 'GP_START_YEAR') return 2005;
        return undefined;
      });

      const mockData2005 = { MRData: {} }; // Empty data
      const mockEmptyDto = new SeasonDto();
      // Leave all fields empty/undefined

      // Mock the shared utility method
      TestUtils.mockHttpRateLimiterRequest().mockResolvedValue(mockData2005);
      (mapper.mapToSeasonDto as jest.Mock).mockReturnValue(mockEmptyDto);

      const result = await service.getChampions();

      // Should not call upsert for empty/invalid data
      expect(repository.upsertChampion).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should throw BadRequestException if GP_START_YEAR is before 1950', async () => {
      // Mock empty database
      (repository.hasChampionsData as jest.Mock).mockResolvedValue(false);

      const baseUrl = 'https://api.jolpi.ca/ergast/f1';
      (configService.get as jest.Mock).mockImplementation((key) => {
        if (key === 'BASE_URL') return baseUrl;
        if (key === 'GP_START_YEAR') return 1949; // Invalid year - before 1950
        return undefined;
      });

      await expect(service.getChampions()).rejects.toThrow(BadRequestException);
      await expect(service.getChampions()).rejects.toThrow(
        'GP_START_YEAR must be 1950 or later. Formula 1 World Championship started in 1950.',
      );
    });

    it('should throw BadRequestException if GP_START_YEAR is after current year', async () => {
      // Mock empty database
      (repository.hasChampionsData as jest.Mock).mockResolvedValue(false);

      const baseUrl = 'https://api.jolpi.ca/ergast/f1';
      (configService.get as jest.Mock).mockImplementation((key) => {
        if (key === 'BASE_URL') return baseUrl;
        if (key === 'GP_START_YEAR') return 2007; // Invalid year - after current year (2006)
        return undefined;
      });

      await expect(service.getChampions()).rejects.toThrow(BadRequestException);
      await expect(service.getChampions()).rejects.toThrow(
        'GP_START_YEAR cannot be greater than the current year (2006).',
      );
    });

    it('should accept GP_START_YEAR of 1950 (minimum valid year)', async () => {
      // Mock empty database
      (repository.hasChampionsData as jest.Mock).mockResolvedValue(false);

      const baseUrl = 'https://api.jolpi.ca/ergast/f1';
      (configService.get as jest.Mock).mockImplementation((key) => {
        if (key === 'BASE_URL') return baseUrl;
        if (key === 'GP_START_YEAR') return 1950; // Valid minimum year
        return undefined;
      });

      const mockData1950 = { MRData: { StandingsTable: { season: '1950' } } };
      const mockDto1950 = new SeasonDto();
      mockDto1950.season = '1950';
      mockDto1950.givenName = 'Giuseppe';
      mockDto1950.familyName = 'Farina';
      mockDto1950.driverId = 'farina';

      // Mock the shared utility method
      TestUtils.mockHttpRateLimiterRequest().mockResolvedValue(mockData1950);
      (mapper.mapToSeasonDto as jest.Mock).mockReturnValue(mockDto1950);
      (repository.upsertChampion as jest.Mock).mockResolvedValue({});

      const result = await service.getChampions();

      // Should not throw an error and should process the data
      expect(result).toContainEqual(mockDto1950);
      expect(repository.upsertChampion).toHaveBeenCalled();
    });

    it('should accept GP_START_YEAR equal to current year', async () => {
      // Mock empty database
      (repository.hasChampionsData as jest.Mock).mockResolvedValue(false);

      const baseUrl = 'https://api.jolpi.ca/ergast/f1';
      (configService.get as jest.Mock).mockImplementation((key) => {
        if (key === 'BASE_URL') return baseUrl;
        if (key === 'GP_START_YEAR') return 2006; // Valid - equal to current year
        return undefined;
      });

      const mockData2006 = { MRData: { StandingsTable: { season: '2006' } } };
      const mockDto2006 = new SeasonDto();
      mockDto2006.season = '2006';
      mockDto2006.givenName = 'Michael';
      mockDto2006.familyName = 'Schumacher';
      mockDto2006.driverId = 'schumacher';

      // Mock the shared utility method
      TestUtils.mockHttpRateLimiterRequest().mockResolvedValue(mockData2006);
      (mapper.mapToSeasonDto as jest.Mock).mockReturnValue(mockDto2006);
      (repository.upsertChampion as jest.Mock).mockResolvedValue({});

      const result = await service.getChampions();

      // Should not throw an error and should process the data
      expect(result).toContainEqual(mockDto2006);
      expect(repository.upsertChampion).toHaveBeenCalled();
    });
  });
});
