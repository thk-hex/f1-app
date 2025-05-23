import { Test, TestingModule } from '@nestjs/testing';
import { RaceWinnersService } from './race-winners.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { RaceWinnersMapper } from './race-winners.mapper';
import { PrismaService } from '../prisma/prisma.service';

describe('RaceWinnersService', () => {
  let service: RaceWinnersService;
  let httpService: HttpService;
  let configService: ConfigService;
  let mapper: RaceWinnersMapper;
  let prismaService: PrismaService;
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
      ],
    }).compile();

    service = module.get<RaceWinnersService>(RaceWinnersService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    mapper = module.get<RaceWinnersMapper>(RaceWinnersMapper);
    prismaService = module.get<PrismaService>(PrismaService);

    // Mock console methods to prevent them from showing in test output
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
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
          updatedAt: new Date() 
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
          updatedAt: new Date() 
        },
      ];
      
      (prismaService.raceWinner.findMany as jest.Mock).mockResolvedValue(mockCachedRaces);
      
      const result = await service.getRaceWinners(year);
      
      expect(prismaService.raceWinner.findMany).toHaveBeenCalledWith({
        where: { season: year.toString() },
        orderBy: { round: 'asc' },
      });
      expect(httpService.get).not.toHaveBeenCalled(); // API should not be called when cache exists
      expect(result).toEqual([
        { 
          gpName: 'Australian Grand Prix', 
          winnerId: 'fisichella',
          winnerGivenName: 'Giancarlo', 
          winnerFamilyName: 'Fisichella'
        },
        { 
          gpName: 'Malaysian Grand Prix', 
          winnerId: 'alonso',
          winnerGivenName: 'Fernando', 
          winnerFamilyName: 'Alonso'
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
                raceName: 'Australian Grand Prix',
                Results: [
                  {
                    Driver: {
                      driverId: 'fisichella',
                      givenName: 'Giancarlo',
                      familyName: 'Fisichella'
                    }
                  }
                ]
              },
              {
                raceName: 'Malaysian Grand Prix',
                Results: [
                  {
                    Driver: {
                      driverId: 'alonso',
                      givenName: 'Fernando',
                      familyName: 'Alonso'
                    }
                  }
                ]
              }
            ]
          } 
        } 
      };
      
      const mockDtos = [
        { 
          gpName: 'Australian Grand Prix', 
          winnerId: 'fisichella',
          winnerGivenName: 'Giancarlo', 
          winnerFamilyName: 'Fisichella'
        },
        { 
          gpName: 'Malaysian Grand Prix', 
          winnerId: 'alonso',
          winnerGivenName: 'Fernando', 
          winnerFamilyName: 'Alonso'
        },
      ];

      // Create a spy on the makeRateLimitedRequest method before replacing its implementation
      const makeRateLimitedRequestSpy = jest.spyOn(
        service as any,
        'makeRateLimitedRequest',
      ).mockResolvedValue(mockData);
      
      // Configure mapper mock to return appropriate DTOs
      (mapper.mapToRaceDtos as jest.Mock).mockReturnValue(mockDtos);

      (prismaService.raceWinner.upsert as jest.Mock).mockResolvedValue({}); // Mock successful database upsert

      const result = await service.getRaceWinners(year);

      // Verify correct interactions
      expect(prismaService.raceWinner.findMany).toHaveBeenCalledTimes(1);
      expect(makeRateLimitedRequestSpy).toHaveBeenCalledWith(`${baseUrl}/${year}/results/1.json`);
      
      // Verify that data was stored in the database
      expect(prismaService.raceWinner.upsert).toHaveBeenCalledWith({
        where: { 
          season_round: {
            season: year.toString(),
            round: '1',
          }
        },
        update: { 
          gpName: 'Australian Grand Prix', 
          winnerId: 'fisichella',
          winnerGivenName: 'Giancarlo', 
          winnerFamilyName: 'Fisichella'
        },
        create: { 
          season: year.toString(),
          round: '1',
          gpName: 'Australian Grand Prix', 
          winnerId: 'fisichella',
          winnerGivenName: 'Giancarlo', 
          winnerFamilyName: 'Fisichella'
        },
      });
      
      expect(prismaService.raceWinner.upsert).toHaveBeenCalledWith({
        where: { 
          season_round: {
            season: year.toString(),
            round: '2',
          }
        },
        update: { 
          gpName: 'Malaysian Grand Prix', 
          winnerId: 'alonso',
          winnerGivenName: 'Fernando', 
          winnerFamilyName: 'Alonso'
        },
        create: { 
          season: year.toString(),
          round: '2',
          gpName: 'Malaysian Grand Prix', 
          winnerId: 'alonso',
          winnerGivenName: 'Fernando', 
          winnerFamilyName: 'Alonso'
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
  
  describe('makeRateLimitedRequest', () => {
    it('should handle rate limiting using retry-after header', async () => {
      const mockData = { test: 'data' };
      const mockResponse = { 
        data: mockData, 
        headers: { 'retry-after': '1' } 
      };
      
      (httpService.get as jest.Mock).mockReturnValue(of(mockResponse));
      
      // Use mockImplementation on the spy instead of replacing setTimeout completely
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((fn: any) => {
        fn();
        return null as any;
      });
      
      const result = await (service as any).makeRateLimitedRequest('test-url');
      
      expect(setTimeoutSpy).toHaveBeenCalled();
      expect(result).toEqual(mockData);
      
      // Restore the original spy
      setTimeoutSpy.mockRestore();
    });
    
    it('should retry on 429 errors', async () => {
      const mockData = { test: 'data' };
      const mockError = { 
        response: { 
          status: 429, 
          headers: { 'retry-after': '1' } 
        }
      };
      
      const httpGetSpy = httpService.get as jest.Mock;
      // First call fails with 429, second call succeeds
      httpGetSpy
        .mockImplementationOnce(() => throwError(() => mockError))
        .mockImplementationOnce(() => of({ data: mockData, headers: {} }));
      
      // Use mockImplementation on the spy instead of replacing setTimeout completely
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((fn: any) => {
        fn();
        return null as any;
      });
      
      const result = await (service as any).makeRateLimitedRequest('test-url');
      
      expect(httpGetSpy).toHaveBeenCalledTimes(2);
      expect(setTimeoutSpy).toHaveBeenCalled();
      expect(result).toEqual(mockData);
      
      // Restore the original spy
      setTimeoutSpy.mockRestore();
    });
  });
});
