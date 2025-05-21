import { Test, TestingModule } from '@nestjs/testing';
import { RaceWinnersController } from './race-winners.controller';

describe('RaceWinnersController', () => {
  let controller: RaceWinnersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RaceWinnersController],
    }).compile();

    controller = module.get<RaceWinnersController>(RaceWinnersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
