import { Test, TestingModule } from '@nestjs/testing';
import { RaceWinnersService } from './race-winners.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { RaceWinnersMapper } from './race-winners.mapper';
import { PrismaService } from '../prisma/prisma.service';
import { TestUtils } from '../shared/utils/test-utils';
import { CacheService } from '../cache/cache.service';

describe('RaceWinnersService', () => {
  let service: RaceWinnersService;
  let httpService: HttpService;
  let configService: ConfigService;
  let mapper: RaceWinnersMapper;
  let prismaService: PrismaService;
  let cacheService: CacheService;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RaceWinnersService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: RaceWinnersMapper,
          useValue: {
            mapToRaceDtos: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            raceWinner: {
              findMany: jest.fn(),
              upsert: jest.fn(),
            },
            driver: {
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
            getRaceWinnersKey: jest.fn((year) => `race_winners:${year}`),
          },
        },
      ],
    }).compile();

    service = module.get<RaceWinnersService>(RaceWinnersService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    mapper = module.get<RaceWinnersMapper>(RaceWinnersMapper);
    prismaService = module.get<PrismaService>(PrismaService);
    cacheService = module.get<CacheService>(CacheService);

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
    consoleLogSpy?.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRaceWinners', () => {
    it('should return race winners from Redis cache if available', async () => {
      const year = 2005;
      const mockCachedRaceWinners = [
        {
          round: '1',
          gpName: 'Australian Grand Prix',
          winnerId: 'fisichella',
          winnerGivenName: 'Giancarlo',
          winnerFamilyName: 'Fisichella',
        },
        {
          round: '2',
          gpName: 'Malaysian Grand Prix',
          winnerId: 'alonso',
          winnerGivenName: 'Fernando',
          winnerFamilyName: 'Alonso',
        },
      ];

      (cacheService.get as jest.Mock).mockResolvedValue(mockCachedRaceWinners);

      const result = await service.getRaceWinners(year);

      expect(cacheService.get).toHaveBeenCalledWith('race_winners:2005');
      expect(prismaService.raceWinner.findMany).not.toHaveBeenCalled();
      expect(httpService.get).not.toHaveBeenCalled();
      expect(result).toEqual(mockCachedRaceWinners);
    });

    it('should return cached race winners if they exist in the database', async () => {
      const year = 2005;
      const mockCachedRaces = [
        {
          id: 1,
          season: '2005',
          round: '1',
          gpName: 'Australian Grand Prix',
          driverId: 'fisichella',
          createdAt: new Date(),
          updatedAt: new Date(),
          driver: {
            id: 1,
            driverId: 'fisichella',
            givenName: 'Giancarlo',
            familyName: 'Fisichella',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          id: 2,
          season: '2005',
          round: '2',
          gpName: 'Malaysian Grand Prix',
          driverId: 'alonso',
          createdAt: new Date(),
          updatedAt: new Date(),
          driver: {
            id: 2,
            driverId: 'alonso',
            givenName: 'Fernando',
            familyName: 'Alonso',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];

      (cacheService.get as jest.Mock).mockResolvedValue(null);
      (prismaService.raceWinner.findMany as jest.Mock).mockResolvedValue(
        mockCachedRaces,
      );

      const result = await service.getRaceWinners(year);

      expect(cacheService.get).toHaveBeenCalledWith('race_winners:2005');
      expect(prismaService.raceWinner.findMany).toHaveBeenCalledWith({
        where: { season: year.toString() },
        include: {
          driver: true,
        },
      });
      expect(cacheService.set).toHaveBeenCalledWith(
        'race_winners:2005',
        expect.any(Array),
        1800000,
      );
      expect(httpService.get).not.toHaveBeenCalled();
      expect(result).toEqual([
        {
          round: '1',
          gpName: 'Australian Grand Prix',
          winnerId: 'fisichella',
          winnerGivenName: 'Giancarlo',
          winnerFamilyName: 'Fisichella',
        },
        {
          round: '2',
          gpName: 'Malaysian Grand Prix',
          winnerId: 'alonso',
          winnerGivenName: 'Fernando',
          winnerFamilyName: 'Alonso',
        },
      ]);
    });

    it('should return cached race winners sorted by round number (numeric order)', async () => {
      const year = 2005;
      const mockCachedRaces = [
        {
          id: 3,
          season: '2005',
          round: '10',
          gpName: 'Round 10 GP',
          driverId: 'driver3',
          createdAt: new Date(),
          updatedAt: new Date(),
          driver: {
            id: 3,
            driverId: 'driver3',
            givenName: 'Driver',
            familyName: 'Three',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          id: 1,
          season: '2005',
          round: '2',
          gpName: 'Round 2 GP',
          driverId: 'driver1',
          createdAt: new Date(),
          updatedAt: new Date(),
          driver: {
            id: 1,
            driverId: 'driver1',
            givenName: 'Driver',
            familyName: 'One',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          id: 2,
          season: '2005',
          round: '3',
          gpName: 'Round 3 GP',
          driverId: 'driver2',
          createdAt: new Date(),
          updatedAt: new Date(),
          driver: {
            id: 2,
            driverId: 'driver2',
            givenName: 'Driver',
            familyName: 'Two',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];

      (prismaService.raceWinner.findMany as jest.Mock).mockResolvedValue(
        mockCachedRaces,
      );

      const result = await service.getRaceWinners(year);

      expect(result).toEqual([
        {
          round: '2',
          gpName: 'Round 2 GP',
          winnerId: 'driver1',
          winnerGivenName: 'Driver',
          winnerFamilyName: 'One',
        },
        {
          round: '3',
          gpName: 'Round 3 GP',
          winnerId: 'driver2',
          winnerGivenName: 'Driver',
          winnerFamilyName: 'Two',
        },
        {
          round: '10',
          gpName: 'Round 10 GP',
          winnerId: 'driver3',
          winnerGivenName: 'Driver',
          winnerFamilyName: 'Three',
        },
      ]);
    });

    it('should fetch from API and store in database if no cached race winners exist', async () => {
      const year = 2005;

      (prismaService.raceWinner.findMany as jest.Mock).mockResolvedValue([]);

      const baseUrl = 'https://example.com';
      (configService.get as jest.Mock).mockImplementation((key) => {
        if (key === 'BASE_URL') return baseUrl;
        return undefined;
      });

      const mockData = {
        MRData: {
          RaceTable: {
            Races: [
              {
                round: '1',
                raceName: 'Australian Grand Prix',
                Results: [
                  {
                    Driver: {
                      driverId: 'fisichella',
                      givenName: 'Giancarlo',
                      familyName: 'Fisichella',
                    },
                  },
                ],
              },
              {
                round: '2',
                raceName: 'Malaysian Grand Prix',
                Results: [
                  {
                    Driver: {
                      driverId: 'alonso',
                      givenName: 'Fernando',
                      familyName: 'Alonso',
                    },
                  },
                ],
              },
            ],
          },
        },
      };

      const mockDtos = [
        {
          round: '1',
          gpName: 'Australian Grand Prix',
          winnerId: 'fisichella',
          winnerGivenName: 'Giancarlo',
          winnerFamilyName: 'Fisichella',
        },
        {
          round: '2',
          gpName: 'Malaysian Grand Prix',
          winnerId: 'alonso',
          winnerGivenName: 'Fernando',
          winnerFamilyName: 'Alonso',
        },
      ];

      const makeRateLimitedRequestSpy =
        TestUtils.mockHttpRateLimiterRequest().mockResolvedValue(mockData);

      (mapper.mapToRaceDtos as jest.Mock).mockReturnValue(mockDtos);

      (prismaService.driver.upsert as jest.Mock).mockResolvedValue({});
      (prismaService.raceWinner.upsert as jest.Mock).mockResolvedValue({});

      const result = await service.getRaceWinners(year);

      expect(prismaService.raceWinner.findMany).toHaveBeenCalledTimes(1);
      expect(makeRateLimitedRequestSpy).toHaveBeenCalledWith(
        httpService,
        `${baseUrl}/${year}/results/1.json`,
      );

      expect(prismaService.driver.upsert).toHaveBeenCalledWith({
        where: { driverId: 'fisichella' },
        update: {
          givenName: 'Giancarlo',
          familyName: 'Fisichella',
        },
        create: {
          driverId: 'fisichella',
          givenName: 'Giancarlo',
          familyName: 'Fisichella',
        },
      });

      expect(prismaService.driver.upsert).toHaveBeenCalledWith({
        where: { driverId: 'alonso' },
        update: {
          givenName: 'Fernando',
          familyName: 'Alonso',
        },
        create: {
          driverId: 'alonso',
          givenName: 'Fernando',
          familyName: 'Alonso',
        },
      });

      expect(prismaService.raceWinner.upsert).toHaveBeenCalledWith({
        where: {
          season_round: {
            season: year.toString(),
            round: '1',
          },
        },
        update: {
          gpName: 'Australian Grand Prix',
          driverId: 'fisichella',
        },
        create: {
          season: year.toString(),
          round: '1',
          gpName: 'Australian Grand Prix',
          driverId: 'fisichella',
        },
      });

      expect(prismaService.raceWinner.upsert).toHaveBeenCalledWith({
        where: {
          season_round: {
            season: year.toString(),
            round: '2',
          },
        },
        update: {
          gpName: 'Malaysian Grand Prix',
          driverId: 'alonso',
        },
        create: {
          season: year.toString(),
          round: '2',
          gpName: 'Malaysian Grand Prix',
          driverId: 'alonso',
        },
      });

      expect(result).toEqual(mockDtos);
    });

    it('should throw an error if BASE_URL is not configured', async () => {
      const year = 2005;
      (prismaService.raceWinner.findMany as jest.Mock).mockResolvedValue([]);
      (configService.get as jest.Mock).mockReturnValue(undefined);

      await expect(service.getRaceWinners(year)).rejects.toThrow(
        'BASE_URL not configured in .env file',
      );
    });
  });
});
