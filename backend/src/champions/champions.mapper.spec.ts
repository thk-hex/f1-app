import { Test, TestingModule } from '@nestjs/testing';
import { ChampionsMapper } from './champions.mapper';
import { SeasonDto } from './dto/season.dto';

describe('ChampionsMapper', () => {
  let mapper: ChampionsMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChampionsMapper],
    }).compile();

    mapper = module.get<ChampionsMapper>(ChampionsMapper);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('mapToSeasonDto', () => {
    it('should map complete F1 API response to SeasonDto including driverId', () => {
      const mockApiResponse = {
        MRData: {
          StandingsTable: {
            season: '2021',
            StandingsLists: [
              {
                DriverStandings: [
                  {
                    Driver: {
                      driverId: 'hamilton',
                      givenName: 'Lewis',
                      familyName: 'Hamilton',
                    },
                  },
                ],
              },
            ],
          },
        },
      };

      const result = mapper.mapToSeasonDto(mockApiResponse);

      expect(result).toBeInstanceOf(SeasonDto);
      expect(result.season).toBe('2021');
      expect(result.givenName).toBe('Lewis');
      expect(result.familyName).toBe('Hamilton');
      expect(result.driverId).toBe('hamilton');
    });

    it('should handle missing optional fields with empty strings', () => {
      const mockApiResponse = {
        MRData: {
          StandingsTable: {
            season: '2020',
            StandingsLists: [
              {
                DriverStandings: [
                  {
                    Driver: {
                      // Missing driverId, givenName, and familyName
                    },
                  },
                ],
              },
            ],
          },
        },
      };

      const result = mapper.mapToSeasonDto(mockApiResponse);

      expect(result).toBeInstanceOf(SeasonDto);
      expect(result.season).toBe('2020');
      expect(result.givenName).toBe('');
      expect(result.familyName).toBe('');
      expect(result.driverId).toBe('');
    });

    it('should handle missing MRData with empty strings', () => {
      const mockApiResponse = {};

      const result = mapper.mapToSeasonDto(mockApiResponse);

      expect(result).toBeInstanceOf(SeasonDto);
      expect(result.season).toBe('');
      expect(result.givenName).toBe('');
      expect(result.familyName).toBe('');
      expect(result.driverId).toBe('');
    });

    it('should handle missing StandingsTable with empty strings', () => {
      const mockApiResponse = {
        MRData: {},
      };

      const result = mapper.mapToSeasonDto(mockApiResponse);

      expect(result).toBeInstanceOf(SeasonDto);
      expect(result.season).toBe('');
      expect(result.givenName).toBe('');
      expect(result.familyName).toBe('');
      expect(result.driverId).toBe('');
    });

    it('should handle missing StandingsLists with empty strings', () => {
      const mockApiResponse = {
        MRData: {
          StandingsTable: {
            season: '2019',
          },
        },
      };

      const result = mapper.mapToSeasonDto(mockApiResponse);

      expect(result).toBeInstanceOf(SeasonDto);
      expect(result.season).toBe('2019');
      expect(result.givenName).toBe('');
      expect(result.familyName).toBe('');
      expect(result.driverId).toBe('');
    });

    it('should handle empty StandingsLists array with empty strings', () => {
      const mockApiResponse = {
        MRData: {
          StandingsTable: {
            season: '2018',
            StandingsLists: [],
          },
        },
      };

      const result = mapper.mapToSeasonDto(mockApiResponse);

      expect(result).toBeInstanceOf(SeasonDto);
      expect(result.season).toBe('2018');
      expect(result.givenName).toBe('');
      expect(result.familyName).toBe('');
      expect(result.driverId).toBe('');
    });

    it('should handle missing DriverStandings with empty strings', () => {
      const mockApiResponse = {
        MRData: {
          StandingsTable: {
            season: '2017',
            StandingsLists: [{}],
          },
        },
      };

      const result = mapper.mapToSeasonDto(mockApiResponse);

      expect(result).toBeInstanceOf(SeasonDto);
      expect(result.season).toBe('2017');
      expect(result.givenName).toBe('');
      expect(result.familyName).toBe('');
      expect(result.driverId).toBe('');
    });

    it('should handle real F1 API response format for multiple years', () => {
      const testCases = [
        {
          response: {
            MRData: {
              StandingsTable: {
                season: '2022',
                StandingsLists: [
                  {
                    DriverStandings: [
                      {
                        Driver: {
                          driverId: 'verstappen',
                          givenName: 'Max',
                          familyName: 'Verstappen',
                        },
                      },
                    ],
                  },
                ],
              },
            },
          },
          expected: {
            season: '2022',
            givenName: 'Max',
            familyName: 'Verstappen',
            driverId: 'verstappen',
          },
        },
        {
          response: {
            MRData: {
              StandingsTable: {
                season: '2008',
                StandingsLists: [
                  {
                    DriverStandings: [
                      {
                        Driver: {
                          driverId: 'hamilton',
                          givenName: 'Lewis',
                          familyName: 'Hamilton',
                        },
                      },
                    ],
                  },
                ],
              },
            },
          },
          expected: {
            season: '2008',
            givenName: 'Lewis',
            familyName: 'Hamilton',
            driverId: 'hamilton',
          },
        },
      ];

      testCases.forEach(({ response, expected }) => {
        const result = mapper.mapToSeasonDto(response);
        expect(result.season).toBe(expected.season);
        expect(result.givenName).toBe(expected.givenName);
        expect(result.familyName).toBe(expected.familyName);
        expect(result.driverId).toBe(expected.driverId);
      });
    });

    it('should use class-transformer to create proper instance', () => {
      const mockApiResponse = {
        MRData: {
          StandingsTable: {
            season: '2023',
            StandingsLists: [
              {
                DriverStandings: [
                  {
                    Driver: {
                      driverId: 'verstappen',
                      givenName: 'Max',
                      familyName: 'Verstappen',
                    },
                  },
                ],
              },
            ],
          },
        },
      };

      const result = mapper.mapToSeasonDto(mockApiResponse);

      // Verify it's a proper instance of SeasonDto
      expect(result).toBeInstanceOf(SeasonDto);
      expect(result.constructor.name).toBe('SeasonDto');

      // Verify all @Expose decorated properties are present
      expect(result.hasOwnProperty('season')).toBe(true);
      expect(result.hasOwnProperty('givenName')).toBe(true);
      expect(result.hasOwnProperty('familyName')).toBe(true);
      expect(result.hasOwnProperty('driverId')).toBe(true);
    });
  });
});
