import { Test, TestingModule } from '@nestjs/testing';
import { RaceWinnersService } from './race-winners.service';

describe('RaceWinnersService', () => {
  let service: RaceWinnersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RaceWinnersService],
    }).compile();

    service = module.get<RaceWinnersService>(RaceWinnersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
