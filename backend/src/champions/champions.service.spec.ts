import { Test, TestingModule } from '@nestjs/testing';
import { ChampionsService } from './champions.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { ChampionsMapper } from './champions.mapper';
import { SeasonDto } from './dto/season.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('ChampionsService', () => {
  let service: ChampionsService;
  let httpService: HttpService;
  let configService: ConfigService;
  let mapper: ChampionsMapper;
  let prismaService: PrismaService;
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
          provide: PrismaService,
          useValue: {
            champion: {
              findMany: jest.fn(),
              upsert: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ChampionsService>(ChampionsService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    mapper = module.get<ChampionsMapper>(ChampionsMapper);
    prismaService = module.get<PrismaService>(PrismaService);

    // Mock console methods to prevent them from showing in test output
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Mock Date.getFullYear to return a consistent value
    jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2006);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getChampions', () => {
    it('should return cached champions if they exist in the database', async () => {
      const mockCachedChampions = [
        { 
          id: 1, 
          season: '2005', 
          givenName: 'Fernando', 
          familyName: 'Alonso', 
          driverId: 'alonso',
          createdAt: new Date(), 
          updatedAt: new Date() 
        },
        { 
          id: 2, 
          season: '2006', 
          givenName: 'Michael', 
          familyName: 'Schumacher', 
          driverId: 'schumacher',
          createdAt: new Date(), 
          updatedAt: new Date() 
        },
      ];
      
      (prismaService.champion.findMany as jest.Mock).mockResolvedValue(mockCachedChampions);
      
      const result = await service.getChampions();
      
      expect(prismaService.champion.findMany).toHaveBeenCalled();
      expect(httpService.get).not.toHaveBeenCalled(); // API should not be called when cache exists
      expect(result).toEqual([
        { season: '2005', givenName: 'Fernando', familyName: 'Alonso', driverId: 'alonso' },
        { season: '2006', givenName: 'Michael', familyName: 'Schumacher', driverId: 'schumacher' },
      ]);
    });

    it('should handle cached champions with missing driverId', async () => {
      const mockCachedChampions = [
        { 
          id: 1, 
          season: '2005', 
          givenName: 'Fernando', 
          familyName: 'Alonso', 
          driverId: null, // Simulate missing driverId
          createdAt: new Date(), 
          updatedAt: new Date() 
        },
      ];
      
      (prismaService.champion.findMany as jest.Mock).mockResolvedValue(mockCachedChampions);
      
      const result = await service.getChampions();
      
      expect(result).toEqual([
        { season: '2005', givenName: 'Fernando', familyName: 'Alonso', driverId: '' },
      ]);
    });

    it('should fetch from API and store in database if no cached champions exist', async () => {
      // Mock empty database
      (prismaService.champion.findMany as jest.Mock).mockResolvedValue([]);
      
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

      // Create a spy on the makeRateLimitedRequest method before replacing its implementation
      const makeRateLimitedRequestSpy = jest.spyOn(
        service as any,
        'makeRateLimitedRequest',
      );
      
      // Override the implementation of the spied method
      makeRateLimitedRequestSpy.mockImplementation((url: string) => {
        if (url.includes('2005')) return Promise.resolve(mockData2005);
        if (url.includes('2006')) return Promise.resolve(mockData2006);
        return Promise.resolve({});
      });

      // Configure mapper mock to return appropriate DTO based on input
      (mapper.mapToSeasonDto as jest.Mock).mockImplementation((data) => {
        if (data === mockData2005) return mockDto2005;
        if (data === mockData2006) return mockDto2006;
        return new SeasonDto();
      });

      (prismaService.champion.upsert as jest.Mock).mockResolvedValue({}); // Mock successful database upsert

      const result = await service.getChampions();

      // Verify correct interactions
      expect(prismaService.champion.findMany).toHaveBeenCalledTimes(1);
      expect(makeRateLimitedRequestSpy).toHaveBeenCalledWith(`${baseUrl}/2005/driverstandings/1.json`);
      expect(makeRateLimitedRequestSpy).toHaveBeenCalledWith(`${baseUrl}/2006/driverstandings/1.json`);
      
      // Verify that data was stored in the database with driverId
      expect(prismaService.champion.upsert).toHaveBeenCalledWith({
        where: { season: '2005' },
        update: { givenName: 'Fernando', familyName: 'Alonso', driverId: 'alonso' },
        create: { season: '2005', givenName: 'Fernando', familyName: 'Alonso', driverId: 'alonso' },
      });
      
      expect(prismaService.champion.upsert).toHaveBeenCalledWith({
        where: { season: '2006' },
        update: { givenName: 'Michael', familyName: 'Schumacher', driverId: 'schumacher' },
        create: { season: '2006', givenName: 'Michael', familyName: 'Schumacher', driverId: 'schumacher' },
      });
      
      // Verify the result
      expect(result).toContainEqual(mockDto2005);
      expect(result).toContainEqual(mockDto2006);
    });

    it('should throw an error if BASE_URL is not configured', async () => {
      (prismaService.champion.findMany as jest.Mock).mockResolvedValue([]);
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
      (prismaService.champion.findMany as jest.Mock).mockResolvedValue([]);
      
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
      
      // Mock the private method with proper error/success behavior
      const makeRateLimitedRequestSpy = jest.spyOn(
        service as any,
        'makeRateLimitedRequest',
      );

      makeRateLimitedRequestSpy.mockImplementation((url: string) => {
        if (url.includes('2005')) {
          return Promise.reject(new Error('API error for 2005'));
        }
        if (url.includes('2006')) {
          return Promise.resolve(mockData2006);
        }
        return Promise.resolve({});
      });
      
      (mapper.mapToSeasonDto as jest.Mock).mockReturnValue(mockDto2006);
      (prismaService.champion.upsert as jest.Mock).mockResolvedValue({});
      
      const result = await service.getChampions();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching champion standings for 2005:',
        'API error for 2005',
      );
      
      // Verify the database operation was called for the successful request with driverId
      expect(prismaService.champion.upsert).toHaveBeenCalledWith({
        where: { season: '2006' },
        update: { givenName: 'Michael', familyName: 'Schumacher', driverId: 'schumacher' },
        create: { season: '2006', givenName: 'Michael', familyName: 'Schumacher', driverId: 'schumacher' },
      });
      
      // We should have at least the 2006 result in our array
      expect(result).toContainEqual(mockDto2006);
    });

    it('should handle empty season data from mapper', async () => {
      // Mock empty database
      (prismaService.champion.findMany as jest.Mock).mockResolvedValue([]);
      
      const baseUrl = 'https://api.jolpi.ca/ergast/f1';
      (configService.get as jest.Mock).mockImplementation((key) => {
        if (key === 'BASE_URL') return baseUrl;
        if (key === 'GP_START_YEAR') return 2005;
        return undefined;
      });
      
      const mockData2005 = { MRData: {} }; // Empty data
      const mockEmptyDto = new SeasonDto();
      // Leave all fields empty/undefined
      
      // Create a spy on the makeRateLimitedRequest method
      const makeRateLimitedRequestSpy = jest.spyOn(
        service as any,
        'makeRateLimitedRequest',
      );
      
      makeRateLimitedRequestSpy.mockResolvedValue(mockData2005);
      (mapper.mapToSeasonDto as jest.Mock).mockReturnValue(mockEmptyDto);
      
      const result = await service.getChampions();
      
      // Should not call upsert for empty/invalid data
      expect(prismaService.champion.upsert).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should throw BadRequestException if GP_START_YEAR is before 1950', async () => {
      // Mock empty database
      (prismaService.champion.findMany as jest.Mock).mockResolvedValue([]);
      
      const baseUrl = 'https://api.jolpi.ca/ergast/f1';
      (configService.get as jest.Mock).mockImplementation((key) => {
        if (key === 'BASE_URL') return baseUrl;
        if (key === 'GP_START_YEAR') return 1949; // Invalid year - before 1950
        return undefined;
      });
      
      await expect(service.getChampions()).rejects.toThrow(BadRequestException);
      await expect(service.getChampions()).rejects.toThrow(
        'GP_START_YEAR must be 1950 or later. Formula 1 World Championship started in 1950.'
      );
    });

    it('should throw BadRequestException if GP_START_YEAR is after current year', async () => {
      // Mock empty database
      (prismaService.champion.findMany as jest.Mock).mockResolvedValue([]);
      
      const baseUrl = 'https://api.jolpi.ca/ergast/f1';
      (configService.get as jest.Mock).mockImplementation((key) => {
        if (key === 'BASE_URL') return baseUrl;
        if (key === 'GP_START_YEAR') return 2007; // Invalid year - after current year (2006)
        return undefined;
      });
      
      await expect(service.getChampions()).rejects.toThrow(BadRequestException);
      await expect(service.getChampions()).rejects.toThrow(
        'GP_START_YEAR cannot be greater than the current year (2006).'
      );
    });

    it('should accept GP_START_YEAR of 1950 (minimum valid year)', async () => {
      // Mock empty database
      (prismaService.champion.findMany as jest.Mock).mockResolvedValue([]);
      
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
      
      // Create a spy on the makeRateLimitedRequest method
      const makeRateLimitedRequestSpy = jest.spyOn(
        service as any,
        'makeRateLimitedRequest',
      );
      
      makeRateLimitedRequestSpy.mockResolvedValue(mockData1950);
      (mapper.mapToSeasonDto as jest.Mock).mockReturnValue(mockDto1950);
      (prismaService.champion.upsert as jest.Mock).mockResolvedValue({});
      
      const result = await service.getChampions();
      
      // Should not throw an error and should process the data
      expect(result).toContainEqual(mockDto1950);
      expect(prismaService.champion.upsert).toHaveBeenCalled();
    });

    it('should accept GP_START_YEAR equal to current year', async () => {
      // Mock empty database
      (prismaService.champion.findMany as jest.Mock).mockResolvedValue([]);
      
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
      
      // Create a spy on the makeRateLimitedRequest method
      const makeRateLimitedRequestSpy = jest.spyOn(
        service as any,
        'makeRateLimitedRequest',
      );
      
      makeRateLimitedRequestSpy.mockResolvedValue(mockData2006);
      (mapper.mapToSeasonDto as jest.Mock).mockReturnValue(mockDto2006);
      (prismaService.champion.upsert as jest.Mock).mockResolvedValue({});
      
      const result = await service.getChampions();
      
      // Should not throw an error and should process the data
      expect(result).toContainEqual(mockDto2006);
      expect(prismaService.champion.upsert).toHaveBeenCalled();
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

    it('should apply default rate limiting even without headers', async () => {
      const mockData = { test: 'data' };
      const mockResponse = { 
        data: mockData, 
        headers: {} // No rate limiting headers
      };
      
      (httpService.get as jest.Mock).mockReturnValue(of(mockResponse));
      
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((fn: any) => {
        fn();
        return null as any;
      });
      
      const result = await (service as any).makeRateLimitedRequest('test-url');
      
      // Should still apply default 250ms rate limiting
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 250);
      expect(result).toEqual(mockData);
      
      setTimeoutSpy.mockRestore();
    });

    it('should handle non-429 errors by rethrowing them', async () => {
      const mockError = { 
        response: { 
          status: 500, 
          statusText: 'Internal Server Error'
        }
      };
      
      (httpService.get as jest.Mock).mockReturnValue(throwError(() => mockError));
      
      await expect((service as any).makeRateLimitedRequest('test-url')).rejects.toEqual(mockError);
    });
  });
});
