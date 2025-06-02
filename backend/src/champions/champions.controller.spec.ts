import { Test, TestingModule } from '@nestjs/testing';
import { ChampionsController } from './champions.controller';
import { ChampionsService } from './champions.service';
import { SeasonDto } from './dto/season.dto';
import { TestUtils } from '../shared/utils/test-utils';

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

    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    describe('when controller is created', () => {
      it('should be defined', () => {
        // Given/When/Then
        expect(controller).toBeDefined();
        expect(service).toBeDefined();
      });
    });
  });

  describe('getChampions', () => {
    describe('when service returns champions successfully', () => {
      it('should return the list of champions from the service', async () => {
        // Given
        const expectedChampions = TestUtils.createMultipleSeasons(2, 2022);
        mockChampionsService.getChampions.mockResolvedValue(expectedChampions);

        // When
        const result = await controller.getChampions();

        // Then
        expect(service.getChampions).toHaveBeenCalledTimes(1);
        expect(service.getChampions).toHaveBeenCalledWith();
        expect(result).toEqual(expectedChampions);
        expect(Array.isArray(result)).toBeTruthy();
        expect(result).toHaveLength(2);
        
        // Validate structure of returned data
        result.forEach(season => TestUtils.expectValidSeasonDto(season));
      });
    });

    describe('when service returns empty list', () => {
      it('should return an empty array', async () => {
        // Given
        const emptyChampions: SeasonDto[] = [];
        mockChampionsService.getChampions.mockResolvedValue(emptyChampions);

        // When
        const result = await controller.getChampions();

        // Then
        expect(service.getChampions).toHaveBeenCalledTimes(1);
        expect(result).toEqual([]);
        expect(Array.isArray(result)).toBeTruthy();
        expect(result).toHaveLength(0);
      });
    });

    describe('when service returns single champion', () => {
      it('should return array with one champion', async () => {
        // Given
        const singleChampion = [TestUtils.createSeasonDto({
          season: '2023',
          givenName: 'Max',
          familyName: 'Verstappen',
          driverId: 'verstappen',
        })];
        mockChampionsService.getChampions.mockResolvedValue(singleChampion);

        // When
        const result = await controller.getChampions();

        // Then
        expect(service.getChampions).toHaveBeenCalledTimes(1);
        expect(result).toEqual(singleChampion);
        expect(result).toHaveLength(1);
        expect(result[0].season).toBe('2023');
        expect(result[0].givenName).toBe('Max');
        expect(result[0].familyName).toBe('Verstappen');
        expect(result[0].driverId).toBe('verstappen');
      });
    });

    describe('when service throws an error', () => {
      it('should propagate the error to the client', async () => {
        // Given
        const serviceError = new Error('Service unavailable');
        mockChampionsService.getChampions.mockRejectedValue(serviceError);

        // When/Then
        await expect(controller.getChampions()).rejects.toThrow('Service unavailable');
        expect(service.getChampions).toHaveBeenCalledTimes(1);
      });
    });

    describe('when service throws custom business error', () => {
      it('should propagate the business error with original message', async () => {
        // Given
        const businessError = new Error('Invalid configuration: GP_START_YEAR must be valid');
        mockChampionsService.getChampions.mockRejectedValue(businessError);

        // When/Then
        await expect(controller.getChampions()).rejects.toThrow('Invalid configuration: GP_START_YEAR must be valid');
        expect(service.getChampions).toHaveBeenCalledTimes(1);
      });
    });

    describe('when service throws network-related error', () => {
      it('should propagate the network error', async () => {
        // Given
        const networkError = new Error('Network timeout');
        mockChampionsService.getChampions.mockRejectedValue(networkError);

        // When/Then
        await expect(controller.getChampions()).rejects.toThrow('Network timeout');
        expect(service.getChampions).toHaveBeenCalledTimes(1);
      });
    });
  });
});
