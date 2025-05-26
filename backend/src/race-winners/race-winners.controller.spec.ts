import { Test, TestingModule } from '@nestjs/testing';
import { RaceWinnersController } from './race-winners.controller';
import { RaceWinnersService } from './race-winners.service';
import { RaceDto } from './dto/race.dto';

describe('RaceWinnersController', () => {
  let controller: RaceWinnersController;
  let service: RaceWinnersService;

  const mockRaceWinnersService = {
    getRaceWinners: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RaceWinnersController],
      providers: [
        {
          provide: RaceWinnersService,
          useValue: mockRaceWinnersService,
        },
      ],
    }).compile();

    controller = module.get<RaceWinnersController>(RaceWinnersController);
    service = module.get<RaceWinnersService>(RaceWinnersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRaceWinners', () => {
    it('should call raceWinnersService.getRaceWinners with the provided year and return its result', async () => {
      const year = 2005;
      const mockRace1 = new RaceDto();
      mockRace1.round = '1';
      mockRace1.gpName = 'Australian Grand Prix';
      mockRace1.winnerId = 'fisichella';
      mockRace1.winnerGivenName = 'Giancarlo';
      mockRace1.winnerFamilyName = 'Fisichella';

      const mockRace2 = new RaceDto();
      mockRace2.round = '2';
      mockRace2.gpName = 'Malaysian Grand Prix';
      mockRace2.winnerId = 'alonso';
      mockRace2.winnerGivenName = 'Fernando';
      mockRace2.winnerFamilyName = 'Alonso';

      const mockResult = [mockRace1, mockRace2];

      mockRaceWinnersService.getRaceWinners.mockResolvedValue(mockResult);

      const result = await controller.getRaceWinners(year);

      expect(service.getRaceWinners).toHaveBeenCalledWith(year);
      expect(result).toEqual(mockResult);
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
    });

    it('should propagate errors from raceWinnersService.getRaceWinners', async () => {
      const year = 2005;
      const mockError = new Error('Service error');
      mockRaceWinnersService.getRaceWinners.mockRejectedValue(mockError);

      await expect(controller.getRaceWinners(year)).rejects.toThrow(
        'Service error',
      );
    });
  });
});
