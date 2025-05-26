import { Test, TestingModule } from '@nestjs/testing';
import { RaceWinnersService } from './race-winners.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { RaceWinnersMapper } from './race-winners.mapper';
import { PrismaService } from '../prisma/prisma.service';
import { TestUtils } from '../shared/utils';
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

    // Mock console methods to prevent them from showing in test output
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
    consoleLogSpy?.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRaceWinners', () => {
    it('should return cached race winners if they exist in the database', async () => {
      const year = 2005;
      const mockCachedRaces = [
        {
          id: 1,
          season: '2005',
          round: '1',
          gpName: 'Australian Grand Prix',
          winnerId: 'fisichella',
          winnerGivenName: 'Giancarlo',
          winnerFamilyName: 'Fisichella',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          season: '2005',
          round: '2',
          gpName: 'Malaysian Grand Prix',
          winnerId: 'alonso',
          winnerGivenName: 'Fernando',
          winnerFamilyName: 'Alonso',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prismaService.raceWinner.findMany as jest.Mock).mockResolvedValue(
        mockCachedRaces,
      );

      const result = await service.getRaceWinners(year);

      expect(prismaService.raceWinner.findMany).toHaveBeenCalledWith({
        where: { season: year.toString() },
      });
      expect(httpService.get).not.toHaveBeenCalled(); // API should not be called when cache exists
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
      // Mock data with rounds that would be incorrectly ordered if using string sorting
      const mockCachedRaces = [
        {
          id: 3,
          season: '2005',
          round: '10',
          gpName: 'Round 10 GP',
          winnerId: 'driver3',
          winnerGivenName: 'Driver',
          winnerFamilyName: 'Three',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 1,
          season: '2005',
          round: '2',
          gpName: 'Round 2 GP',
          winnerId: 'driver1',
          winnerGivenName: 'Driver',
          winnerFamilyName: 'One',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          season: '2005',
          round: '3',
          gpName: 'Round 3 GP',
          winnerId: 'driver2',
          winnerGivenName: 'Driver',
          winnerFamilyName: 'Two',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prismaService.raceWinner.findMany as jest.Mock).mockResolvedValue(
        mockCachedRaces,
      );

      const result = await service.getRaceWinners(year);

      // Verify the results are ordered by round number (2, 3, 10) not string order (10, 2, 3)
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

      // Mock empty database
      (prismaService.raceWinner.findMany as jest.Mock).mockResolvedValue([]);

      const baseUrl = 'https://api.jolpi.ca/ergast/f1';
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

      // Mock the shared utility method
      const makeRateLimitedRequestSpy =
        TestUtils.mockHttpRateLimiterRequest().mockResolvedValue(mockData);

      // Configure mapper mock to return appropriate DTOs
      (mapper.mapToRaceDtos as jest.Mock).mockReturnValue(mockDtos);

      (prismaService.raceWinner.upsert as jest.Mock).mockResolvedValue({}); // Mock successful database upsert

      const result = await service.getRaceWinners(year);

      // Verify correct interactions
      expect(prismaService.raceWinner.findMany).toHaveBeenCalledTimes(1);
      expect(makeRateLimitedRequestSpy).toHaveBeenCalledWith(
        httpService,
        `${baseUrl}/${year}/results/1.json`,
      );

      // Verify that data was stored in the database
      expect(prismaService.raceWinner.upsert).toHaveBeenCalledWith({
        where: {
          season_round: {
            season: year.toString(),
            round: '1',
          },
        },
        update: {
          gpName: 'Australian Grand Prix',
          winnerId: 'fisichella',
          winnerGivenName: 'Giancarlo',
          winnerFamilyName: 'Fisichella',
        },
        create: {
          season: year.toString(),
          round: '1',
          gpName: 'Australian Grand Prix',
          winnerId: 'fisichella',
          winnerGivenName: 'Giancarlo',
          winnerFamilyName: 'Fisichella',
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
          winnerId: 'alonso',
          winnerGivenName: 'Fernando',
          winnerFamilyName: 'Alonso',
        },
        create: {
          season: year.toString(),
          round: '2',
          gpName: 'Malaysian Grand Prix',
          winnerId: 'alonso',
          winnerGivenName: 'Fernando',
          winnerFamilyName: 'Alonso',
        },
      });

      // Verify the result
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
