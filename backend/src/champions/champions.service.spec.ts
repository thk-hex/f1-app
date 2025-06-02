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
  let consoleMocks: ReturnType<typeof TestUtils.mockConsole>;
  let yearMock: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChampionsService,
        {
          provide: HttpService,
          useValue: TestUtils.createMockHttpService(),
        },
        {
          provide: ConfigService,
          useValue: TestUtils.createMockConfigService(),
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
          useValue: TestUtils.createMockPrismaService(),
        },
        {
          provide: CacheService,
          useValue: TestUtils.createMockCacheService(),
        },
      ],
    }).compile();

    service = module.get<ChampionsService>(ChampionsService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    mapper = module.get<ChampionsMapper>(ChampionsMapper);
    repository = module.get<ChampionsRepository>(ChampionsRepository);
    cacheService = module.get<CacheService>(CacheService);

    consoleMocks = TestUtils.mockConsole();
    yearMock = TestUtils.mockCurrentYear(2006);

    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleMocks.restore();
    yearMock.mockRestore();
  });

  describe('Initialization', () => {
    describe('when service is created', () => {
      it('should be defined', () => {
        // Given/When/Then
        expect(service).toBeDefined();
      });
    });
  });

  describe('getChampions', () => {
    describe('Cache Layer Tests', () => {
      describe('when champions are available in Redis cache', () => {
        it('should return cached champions without database or API calls', async () => {
          // Given
          const cachedChampions = TestUtils.createMultipleSeasons(2, 2005);
          (cacheService.get as jest.Mock).mockResolvedValue(cachedChampions);

          // When
          const result = await service.getChampions();

          // Then
          expect(cacheService.get).toHaveBeenCalledWith('champions');
          expect(repository.hasChampionsData).not.toHaveBeenCalled();
          expect(repository.findAllChampions).not.toHaveBeenCalled();
          expect(httpService.get).not.toHaveBeenCalled();
          expect(result).toEqual(cachedChampions);
          result.forEach(season => TestUtils.expectValidSeasonDto(season));
        });
      });

      describe('when cache is empty but database has data', () => {
        it('should return database champions and cache them', async () => {
          // Given
          const dbChampions = TestUtils.createMultipleSeasons(2, 2005);
          (cacheService.get as jest.Mock).mockResolvedValue(null);
          (repository.hasChampionsData as jest.Mock).mockResolvedValue(true);
          (repository.findAllChampions as jest.Mock).mockResolvedValue(dbChampions);

          // When
          const result = await service.getChampions();

          // Then
          expect(cacheService.get).toHaveBeenCalledWith('champions');
          expect(repository.hasChampionsData).toHaveBeenCalledTimes(1);
          expect(repository.findAllChampions).toHaveBeenCalledTimes(1);
          expect(cacheService.set).toHaveBeenCalledWith('champions', dbChampions, 3600000);
          expect(httpService.get).not.toHaveBeenCalled();
          expect(result).toEqual(dbChampions);
        });
      });

      describe('when cached champions have missing driverId', () => {
        it('should handle champions with empty driverId gracefully', async () => {
          // Given
          const championsWithEmptyDriverId = [TestUtils.createSeasonDto({
            season: '2005',
            givenName: 'Fernando',
            familyName: 'Alonso',
            driverId: '',
          })];
          (cacheService.get as jest.Mock).mockResolvedValue(null);
          (repository.hasChampionsData as jest.Mock).mockResolvedValue(true);
          (repository.findAllChampions as jest.Mock).mockResolvedValue(championsWithEmptyDriverId);

          // When
          const result = await service.getChampions();

          // Then
          expect(result).toHaveLength(1);
          expect(result[0].driverId).toBe('');
          expect(result[0].givenName).toBe('Fernando');
          expect(result[0].familyName).toBe('Alonso');
        });
      });
    });

    describe('API Fetching Tests', () => {
      beforeEach(() => {
        (cacheService.get as jest.Mock).mockResolvedValue(null);
        (repository.hasChampionsData as jest.Mock).mockResolvedValue(false);
      });

      describe('when no cached data exists', () => {
        it('should fetch from API and store in database', async () => {
          // Given
          const baseUrl = 'https://api.formula1.com';
          (configService.get as jest.Mock).mockImplementation((key) => {
            if (key === 'BASE_URL') return baseUrl;
            if (key === 'GP_START_YEAR') return 2005;
            return undefined;
          });

          const mockApiData2005 = { MRData: { StandingsTable: { season: '2005' } } };
          const mockApiData2006 = { MRData: { StandingsTable: { season: '2006' } } };
          
          const expectedSeasons = TestUtils.createMultipleSeasons(2, 2005);

          const makeRateLimitedRequestSpy = TestUtils.mockHttpRateLimiterRequest(
            (httpService, url: string) => {
              if (url.includes('2005')) return Promise.resolve(mockApiData2005);
              if (url.includes('2006')) return Promise.resolve(mockApiData2006);
              return Promise.resolve({});
            },
          );

          (mapper.mapToSeasonDto as jest.Mock).mockImplementation((data) => {
            if (data === mockApiData2005) return expectedSeasons[0];
            if (data === mockApiData2006) return expectedSeasons[1];
            return new SeasonDto();
          });

          (repository.upsertChampion as jest.Mock).mockResolvedValue({});
          // Mock findAllChampions to return data in descending order
          (repository.findAllChampions as jest.Mock).mockResolvedValue([
            expectedSeasons[1], 
            expectedSeasons[0], 
          ]);

          // When
          const result = await service.getChampions();

          // Then
          expect(repository.hasChampionsData).toHaveBeenCalledTimes(1);
          expect(makeRateLimitedRequestSpy).toHaveBeenCalledWith(
            httpService,
            `${baseUrl}/2005/driverstandings/1.json`,
          );
          expect(makeRateLimitedRequestSpy).toHaveBeenCalledWith(
            httpService,
            `${baseUrl}/2006/driverstandings/1.json`,
          );

          expectedSeasons.forEach(season => {
            expect(repository.upsertChampion).toHaveBeenCalledWith({
              season: season.season,
              givenName: season.givenName,
              familyName: season.familyName,
              driverId: season.driverId,
            });
          });

          expect(result).toHaveLength(2);
          result.forEach(season => TestUtils.expectValidSeasonDto(season));
        });
      });

      describe('when API request fails for one year', () => {
        it('should continue processing other years and log the error', async () => {
          // Given
          const baseUrl = 'https://api.formula1.com';
          (configService.get as jest.Mock).mockImplementation((key) => {
            if (key === 'BASE_URL') return baseUrl;
            if (key === 'GP_START_YEAR') return 2005;
            return undefined;
          });

          const mockApiData2006 = { MRData: { StandingsTable: { season: '2006' } } };
          const expectedSeason2006 = TestUtils.createSeasonDto({
            season: '2006',
            givenName: 'Michael',
            familyName: 'Schumacher',
            driverId: 'schumacher',
          });

          TestUtils.mockHttpRateLimiterRequest((httpService, url: string) => {
            if (url.includes('2005')) {
              return Promise.reject(new Error('API error for 2005'));
            }
            if (url.includes('2006')) {
              return Promise.resolve(mockApiData2006);
            }
            return Promise.resolve({});
          });

          (mapper.mapToSeasonDto as jest.Mock).mockReturnValue(expectedSeason2006);
          (repository.upsertChampion as jest.Mock).mockResolvedValue({});
          // Mock findAllChampions to return the successfully processed season
          (repository.findAllChampions as jest.Mock).mockResolvedValue([expectedSeason2006]);

          // When
          const result = await service.getChampions();

          // Then
          expect(consoleMocks.error).toHaveBeenCalledWith(
            'Error fetching champion standings for 2005:',
            'API error for 2005',
          );
          expect(repository.upsertChampion).toHaveBeenCalledWith({
            season: '2006',
            givenName: 'Michael',
            familyName: 'Schumacher',
            driverId: 'schumacher',
          });
          expect(result).toContainEqual(expectedSeason2006);
        });
      });

      describe('when mapper returns empty season data', () => {
        it('should not store empty seasons and return empty array', async () => {
          // Given
          const baseUrl = 'https://api.formula1.com';
          (configService.get as jest.Mock).mockImplementation((key) => {
            if (key === 'BASE_URL') return baseUrl;
            if (key === 'GP_START_YEAR') return 2005;
            return undefined;
          });

          const mockApiData = { MRData: {} };
          const emptySeasonDto = new SeasonDto();

          TestUtils.mockHttpRateLimiterRequest().mockResolvedValue(mockApiData);
          (mapper.mapToSeasonDto as jest.Mock).mockReturnValue(emptySeasonDto);

          // When
          const result = await service.getChampions();

          // Then
          expect(repository.upsertChampion).not.toHaveBeenCalled();
          expect(result).toEqual([]);
        });
      });
    });

    describe('Configuration Validation Tests', () => {
      beforeEach(() => {
        (cacheService.get as jest.Mock).mockResolvedValue(null);
        (repository.hasChampionsData as jest.Mock).mockResolvedValue(false);
      });

      describe('when BASE_URL is not configured', () => {
        it('should throw descriptive error', async () => {
          // Given
          (configService.get as jest.Mock).mockImplementation((key) => {
            if (key === 'GP_START_YEAR') return 2005;
            return undefined; // BASE_URL not configured
          });

          // When/Then
          await TestUtils.expectAsyncToThrow(
            () => service.getChampions(),
            'BASE_URL not configured in .env file'
          );
        });
      });

      describe('when GP_START_YEAR is before 1950', () => {
        it('should throw BadRequestException with clear message', async () => {
          // Given
          const baseUrl = 'https://api.formula1.com';
          (configService.get as jest.Mock).mockImplementation((key) => {
            if (key === 'BASE_URL') return baseUrl;
            if (key === 'GP_START_YEAR') return 1949;
            return undefined;
          });

          // When/Then
          await expect(service.getChampions()).rejects.toThrow(BadRequestException);
          await expect(service.getChampions()).rejects.toThrow(
            'GP_START_YEAR must be 1950 or later. Formula 1 World Championship started in 1950.',
          );
        });
      });

      describe('when GP_START_YEAR is after current year', () => {
        it('should throw BadRequestException with current year info', async () => {
          // Given
          const baseUrl = 'https://api.formula1.com';
          (configService.get as jest.Mock).mockImplementation((key) => {
            if (key === 'BASE_URL') return baseUrl;
            if (key === 'GP_START_YEAR') return 2007; // Current year is mocked as 2006
            return undefined;
          });

          // When/Then
          await expect(service.getChampions()).rejects.toThrow(BadRequestException);
          await expect(service.getChampions()).rejects.toThrow(
            'GP_START_YEAR cannot be greater than the current year (2006).',
          );
        });
      });

      describe('when GP_START_YEAR is 1950 (minimum valid year)', () => {
        it('should process successfully', async () => {
          // Given
          const baseUrl = 'https://api.formula1.com';
          (configService.get as jest.Mock).mockImplementation((key) => {
            if (key === 'BASE_URL') return baseUrl;
            if (key === 'GP_START_YEAR') return 1950;
            return undefined;
          });

          const mockApiData = { MRData: { StandingsTable: { season: '1950' } } };
          const expectedSeason = TestUtils.createSeasonDto({
            season: '1950',
            givenName: 'Giuseppe',
            familyName: 'Farina',
            driverId: 'farina',
          });

          TestUtils.mockHttpRateLimiterRequest().mockResolvedValue(mockApiData);
          (mapper.mapToSeasonDto as jest.Mock).mockReturnValue(expectedSeason);
          (repository.upsertChampion as jest.Mock).mockResolvedValue({});
          (repository.findAllChampions as jest.Mock).mockResolvedValue([expectedSeason]);

          // When
          const result = await service.getChampions();

          // Then
          expect(result).toContainEqual(expectedSeason);
          expect(repository.upsertChampion).toHaveBeenCalledWith({
            season: '1950',
            givenName: 'Giuseppe',
            familyName: 'Farina',
            driverId: 'farina',
          });
        });
      });

      describe('when GP_START_YEAR equals current year', () => {
        it('should process successfully', async () => {
          // Given
          const baseUrl = 'https://api.formula1.com';
          (configService.get as jest.Mock).mockImplementation((key) => {
            if (key === 'BASE_URL') return baseUrl;
            if (key === 'GP_START_YEAR') return 2006; // Current year is mocked as 2006
            return undefined;
          });

          const mockApiData = { MRData: { StandingsTable: { season: '2006' } } };
          const expectedSeason = TestUtils.createSeasonDto({
            season: '2006',
            givenName: 'Michael',
            familyName: 'Schumacher',
            driverId: 'schumacher',
          });

          TestUtils.mockHttpRateLimiterRequest().mockResolvedValue(mockApiData);
          (mapper.mapToSeasonDto as jest.Mock).mockReturnValue(expectedSeason);
          (repository.upsertChampion as jest.Mock).mockResolvedValue({});
          (repository.findAllChampions as jest.Mock).mockResolvedValue([expectedSeason]);

          // When
          const result = await service.getChampions();

          // Then
          expect(result).toContainEqual(expectedSeason);
          expect(repository.upsertChampion).toHaveBeenCalledWith({
            season: '2006',
            givenName: 'Michael',
            familyName: 'Schumacher',
            driverId: 'schumacher',
          });
        });
      });
    });
  });
});
