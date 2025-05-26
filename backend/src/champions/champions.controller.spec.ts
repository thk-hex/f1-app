import { Test, TestingModule } from '@nestjs/testing';
import { ChampionsController } from './champions.controller';
import { ChampionsService } from './champions.service';
import { SeasonDto } from './dto/season.dto';

describe('ChampionsController', () => {
  let controller: ChampionsController;
  let service: ChampionsService;

  const mockChampionsService = {
    getChampions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChampionsController],
      providers: [
        {
          provide: ChampionsService,
          useValue: mockChampionsService,
        },
      ],
    }).compile();

    controller = module.get<ChampionsController>(ChampionsController);
    service = module.get<ChampionsService>(ChampionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getChampions', () => {
    it('should call championsService.getChampions and return its result', async () => {
      const mockSeason2005 = new SeasonDto();
      mockSeason2005.season = '2005';
      mockSeason2005.givenName = 'Fernando';
      mockSeason2005.familyName = 'Alonso';
      mockSeason2005.driverId = 'alonso';

      const mockSeason2006 = new SeasonDto();
      mockSeason2006.season = '2006';
      mockSeason2006.givenName = 'Michael';
      mockSeason2006.familyName = 'Schumacher';
      mockSeason2006.driverId = 'schumacher';

      const mockResult = [mockSeason2005, mockSeason2006];

      mockChampionsService.getChampions.mockResolvedValue(mockResult);

      const result = await controller.getChampions();

      expect(service.getChampions).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2);
    });

    it('should propagate errors from championsService.getChampions', async () => {
      const mockError = new Error('Service error');
      mockChampionsService.getChampions.mockRejectedValue(mockError);

      await expect(controller.getChampions()).rejects.toThrow('Service error');
    });
  });
});
