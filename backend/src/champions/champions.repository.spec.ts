import { Test, TestingModule } from '@nestjs/testing';
import { ChampionsRepository, ChampionData } from './champions.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('ChampionsRepository', () => {
  let repository: ChampionsRepository;
  let mockPrismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    mockPrismaService = {
      champion: {
        findMany: jest.fn(),
        upsert: jest.fn(),
        count: jest.fn(),
      },
      driver: {
        upsert: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChampionsRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<ChampionsRepository>(ChampionsRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAllChampions', () => {
    it('should return mapped champions data', async () => {
      const dbChampions = [
        {
          season: '2022',
          driver: {
            driverId: 'verstappen',
            givenName: 'Max',
            familyName: 'Verstappen',
          },
        },
        {
          season: '2021',
          driver: {
            driverId: 'hamilton',
            givenName: 'Lewis',
            familyName: 'Hamilton',
          },
        },
      ];

      (mockPrismaService.champion.findMany as jest.Mock).mockResolvedValue(
        dbChampions,
      );

      const result = await repository.findAllChampions();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        season: '2022',
        givenName: 'Max',
        familyName: 'Verstappen',
        driverId: 'verstappen',
      });
      expect(result[1]).toEqual({
        season: '2021',
        givenName: 'Lewis',
        familyName: 'Hamilton',
        driverId: 'hamilton',
      });
      expect(mockPrismaService.champion.findMany).toHaveBeenCalledWith({
        include: { driver: true },
        orderBy: { season: 'desc' },
      });
    });
  });

  describe('upsertChampion', () => {
    it('should upsert champion and driver data', async () => {
      const championData: ChampionData = {
        season: '2021',
        givenName: 'Lewis',
        familyName: 'Hamilton',
        driverId: 'hamilton',
      };

      const mockDriver = {
        driverId: 'hamilton',
        givenName: 'Lewis',
        familyName: 'Hamilton',
      };

      const mockChampion = {
        season: '2021',
        driverId: 'hamilton',
      };

      (mockPrismaService.driver.upsert as jest.Mock).mockResolvedValue(
        mockDriver,
      );
      (mockPrismaService.champion.upsert as jest.Mock).mockResolvedValue(
        mockChampion,
      );

      await repository.upsertChampion(championData);

      expect(mockPrismaService.driver.upsert).toHaveBeenCalledWith({
        where: { driverId: 'hamilton' },
        update: {
          givenName: 'Lewis',
          familyName: 'Hamilton',
        },
        create: {
          driverId: 'hamilton',
          givenName: 'Lewis',
          familyName: 'Hamilton',
        },
      });

      expect(mockPrismaService.champion.upsert).toHaveBeenCalledWith({
        where: { season: '2021' },
        update: { driverId: 'hamilton' },
        create: {
          season: '2021',
          driverId: 'hamilton',
        },
      });
    });
  });

  describe('hasChampionsData', () => {
    it('should return true when champions data exists', async () => {
      (mockPrismaService.champion.count as jest.Mock).mockResolvedValue(5);

      const result = await repository.hasChampionsData();

      expect(result).toBe(true);
      expect(mockPrismaService.champion.count).toHaveBeenCalled();
    });

    it('should return false when no champions data exists', async () => {
      (mockPrismaService.champion.count as jest.Mock).mockResolvedValue(0);

      const result = await repository.hasChampionsData();

      expect(result).toBe(false);
      expect(mockPrismaService.champion.count).toHaveBeenCalled();
    });
  });
});
