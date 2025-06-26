import {
  HttpRateLimiterUtil,
  RateLimitedRequestOptions,
} from './http-rate-limiter.util';
import { Test, TestingModule } from '@nestjs/testing';
import { SeasonDto } from '../../champions/dto/season.dto';
import { RaceDto } from '../../race-winners/dto/race.dto';

export class TestUtils {
  static mockHttpRateLimiterRequest(
    mockImplementation?: (
      url: string,
      options?: RateLimitedRequestOptions,
    ) => Promise<any>,
  ) {
    return jest
      .spyOn(HttpRateLimiterUtil, 'makeRateLimitedRequest')
      .mockImplementation(
        mockImplementation || jest.fn().mockResolvedValue({}),
      );
  }

  static restoreAllMocks() {
    jest.restoreAllMocks();
  }

  static createSeasonDto(overrides: Partial<SeasonDto> = {}): SeasonDto {
    const season = new SeasonDto();
    season.season = overrides.season ?? '2023';
    season.givenName = overrides.givenName ?? 'Max';
    season.familyName = overrides.familyName ?? 'Verstappen';
    season.driverId = overrides.driverId ?? 'verstappen';
    return season;
  }

  static createMultipleSeasons(count: number, baseYear = 2020): SeasonDto[] {
    const seasons: SeasonDto[] = [];
    const drivers = [
      { givenName: 'Max', familyName: 'Verstappen', driverId: 'verstappen' },
      { givenName: 'Lewis', familyName: 'Hamilton', driverId: 'hamilton' },
      { givenName: 'Sebastian', familyName: 'Vettel', driverId: 'vettel' },
      { givenName: 'Fernando', familyName: 'Alonso', driverId: 'alonso' },
    ];

    for (let i = 0; i < count; i++) {
      const driver = drivers[i % drivers.length];
      seasons.push(
        this.createSeasonDto({
          season: (baseYear + i).toString(),
          ...driver,
        }),
      );
    }
    return seasons;
  }

  static createRaceDto(overrides: Partial<RaceDto> = {}): RaceDto {
    const race = new RaceDto();
    race.round = overrides.round ?? '1';
    race.gpName = overrides.gpName ?? 'Australian Grand Prix';
    race.winnerId = overrides.winnerId ?? 'verstappen';
    race.winnerGivenName = overrides.winnerGivenName ?? 'Max';
    race.winnerFamilyName = overrides.winnerFamilyName ?? 'Verstappen';
    return race;
  }

  static createMultipleRaces(count: number): RaceDto[] {
    const races: RaceDto[] = [];
    const raceNames = [
      'Australian Grand Prix',
      'Monaco Grand Prix',
      'British Grand Prix',
      'Italian Grand Prix',
      'Brazilian Grand Prix',
    ];

    for (let i = 0; i < count; i++) {
      races.push(
        this.createRaceDto({
          round: (i + 1).toString(),
          gpName: raceNames[i % raceNames.length],
        }),
      );
    }
    return races;
  }

  static createMockHttpService() {
    return {
      get: jest.fn(),
    };
  }

  static createMockConfigService(config: Record<string, any> = {}) {
    const defaultConfig = {
      BASE_URL: 'https://api.example.com',
      GP_START_YEAR: 2005,
      ...config,
    };

    return {
      get: jest.fn((key: string) => defaultConfig[key]),
    };
  }

  static createMockCacheService() {
    return {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      getChampionsKey: jest.fn().mockReturnValue('champions'),
      getRaceWinnersKey: jest.fn((year: number) => `race_winners:${year}`),
    };
  }

  static createMockPrismaService() {
    return {
      champion: {
        findMany: jest.fn(),
        upsert: jest.fn(),
      },
      raceWinner: {
        findMany: jest.fn(),
        upsert: jest.fn(),
      },
      driver: {
        upsert: jest.fn(),
      },
    };
  }

  static async createTestingModule(
    providers: any[],
    controllers: any[] = [],
  ): Promise<TestingModule> {
    return Test.createTestingModule({
      controllers,
      providers,
    }).compile();
  }

  static expectValidSeasonDto(season: SeasonDto) {
    expect(season).toBeDefined();
    expect(season.season).toBeDefined();
    expect(season.givenName).toBeDefined();
    expect(season.familyName).toBeDefined();
    expect(season.driverId).toBeDefined();
    expect(typeof season.season).toBe('string');
    expect(typeof season.givenName).toBe('string');
    expect(typeof season.familyName).toBe('string');
    expect(typeof season.driverId).toBe('string');
  }

  static expectValidRaceDto(race: RaceDto) {
    expect(race).toBeDefined();
    expect(race.round).toBeDefined();
    expect(race.gpName).toBeDefined();
    expect(race.winnerId).toBeDefined();
    expect(race.winnerGivenName).toBeDefined();
    expect(race.winnerFamilyName).toBeDefined();
    expect(typeof race.round).toBe('string');
    expect(typeof race.gpName).toBe('string');
    expect(typeof race.winnerId).toBe('string');
    expect(typeof race.winnerGivenName).toBe('string');
    expect(typeof race.winnerFamilyName).toBe('string');
  }

  static mockConsole() {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const consoleLogSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {});
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    return {
      error: consoleErrorSpy,
      log: consoleLogSpy,
      warn: consoleWarnSpy,
      restore: () => {
        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
        consoleWarnSpy.mockRestore();
      },
    };
  }

  static async expectAsyncToThrow(
    asyncFn: () => Promise<any>,
    expectedError?: string | Error | typeof Error,
  ) {
    let error: any;
    try {
      await asyncFn();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    if (expectedError) {
      if (typeof expectedError === 'string') {
        expect(error.message).toContain(expectedError);
      } else if (expectedError instanceof Error) {
        expect(error).toEqual(expectedError);
      } else {
        expect(error).toBeInstanceOf(expectedError);
      }
    }
  }

  static mockCurrentYear(year: number) {
    return jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(year);
  }

  static restoreDateMocks() {
    jest.restoreAllMocks();
  }
}
