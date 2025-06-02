import { Test, TestingModule } from '@nestjs/testing';
import { RaceWinnersMapper } from './race-winners.mapper';
import { RaceDto } from './dto/race.dto';

describe('RaceWinnersMapper', () => {
  let mapper: RaceWinnersMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RaceWinnersMapper],
    }).compile();

    mapper = module.get<RaceWinnersMapper>(RaceWinnersMapper);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('mapToRaceDto', () => {
    it('should map complete F1 API race data to RaceDto', () => {
      const raceData = {
        MRData: {
          RaceTable: {
            Races: [
              {
                round: '1',
                raceName: 'Australian Grand Prix',
                Results: [
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

      const result = mapper.mapToRaceDto(raceData, 0);

      expect(result).toBeInstanceOf(RaceDto);
      expect(result.round).toBe('1');
      expect(result.gpName).toBe('Australian Grand Prix');
      expect(result.winnerId).toBe('hamilton');
      expect(result.winnerGivenName).toBe('Lewis');
      expect(result.winnerFamilyName).toBe('Hamilton');
    });

    it('should handle missing raceName with empty string', () => {
      const raceData = {
        MRData: {
          RaceTable: {
            Races: [
              {
                round: '1',
                Results: [
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

      const result = mapper.mapToRaceDto(raceData, 0);

      expect(result.gpName).toBe('');
    });

    it('should handle missing Results array with empty strings', () => {
      const raceData = {
        MRData: {
          RaceTable: {
            Races: [
              {
                round: '1',
                raceName: 'Australian Grand Prix',
              },
            ],
          },
        },
      };

      const result = mapper.mapToRaceDto(raceData, 0);

      expect(result.winnerId).toBeUndefined();
      expect(result.winnerGivenName).toBeUndefined();
      expect(result.winnerFamilyName).toBeUndefined();
    });

    it('should handle empty Results array with empty strings', () => {
      const raceData = {
        MRData: {
          RaceTable: {
            Races: [
              {
                round: '1',
                raceName: 'Australian Grand Prix',
                Results: [],
              },
            ],
          },
        },
      };

      const result = mapper.mapToRaceDto(raceData, 0);

      expect(result.winnerId).toBeUndefined();
      expect(result.winnerGivenName).toBeUndefined();
      expect(result.winnerFamilyName).toBeUndefined();
    });

    it('should handle missing Driver data with empty strings', () => {
      const raceData = {
        MRData: {
          RaceTable: {
            Races: [
              {
                round: '1',
                raceName: 'Australian Grand Prix',
                Results: [{}],
              },
            ],
          },
        },
      };

      const result = mapper.mapToRaceDto(raceData, 0);

      expect(result.winnerId).toBe('');
      expect(result.winnerGivenName).toBe('');
      expect(result.winnerFamilyName).toBe('');
    });

    it('should handle missing driver properties with empty strings', () => {
      const raceData = {
        MRData: {
          RaceTable: {
            Races: [
              {
                round: '1',
                raceName: 'Australian Grand Prix',
                Results: [
                  {
                    Driver: {},
                  },
                ],
              },
            ],
          },
        },
      };

      const result = mapper.mapToRaceDto(raceData, 0);

      expect(result.winnerId).toBe('');
      expect(result.winnerGivenName).toBe('');
      expect(result.winnerFamilyName).toBe('');
    });

    it('should handle missing race at index with empty values', () => {
      const raceData = {
        MRData: {
          RaceTable: {
            Races: [],
          },
        },
      };

      const result = mapper.mapToRaceDto(raceData, 0);

      expect(result.round).toBeUndefined();
      expect(result.gpName).toBeUndefined();
      expect(result.winnerId).toBeUndefined();
      expect(result.winnerGivenName).toBeUndefined();
      expect(result.winnerFamilyName).toBeUndefined();
    });
  });

  describe('mapToRaceDtos', () => {
    it('should map complete F1 API season data to RaceDto array', () => {
      const seasonData = {
        MRData: {
          RaceTable: {
            Races: [
              {
                round: '1',
                raceName: 'Australian Grand Prix',
                Results: [
                  {
                    Driver: {
                      driverId: 'hamilton',
                      givenName: 'Lewis',
                      familyName: 'Hamilton',
                    },
                  },
                ],
              },
              {
                round: '2',
                raceName: 'Bahrain Grand Prix',
                Results: [
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

      const result = mapper.mapToRaceDtos(seasonData);

      expect(result).toHaveLength(2);
      expect(result[0].round).toBe('1');
      expect(result[0].gpName).toBe('Australian Grand Prix');
      expect(result[0].winnerId).toBe('hamilton');
      expect(result[1].round).toBe('2');
      expect(result[1].gpName).toBe('Bahrain Grand Prix');
      expect(result[1].winnerId).toBe('verstappen');
    });

    it('should handle missing MRData with empty array', () => {
      const seasonData = {};

      const result = mapper.mapToRaceDtos(seasonData);

      expect(result).toEqual([]);
    });

    it('should handle missing RaceTable with empty array', () => {
      const seasonData = {
        MRData: {},
      };

      const result = mapper.mapToRaceDtos(seasonData);

      expect(result).toEqual([]);
    });

    it('should handle missing Races array with empty array', () => {
      const seasonData = {
        MRData: {
          RaceTable: {},
        },
      };

      const result = mapper.mapToRaceDtos(seasonData);

      expect(result).toEqual([]);
    });

    it('should handle empty Races array', () => {
      const seasonData = {
        MRData: {
          RaceTable: {
            Races: [],
          },
        },
      };

      const result = mapper.mapToRaceDtos(seasonData);

      expect(result).toEqual([]);
    });
  });
});
