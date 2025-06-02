import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('getHello', () => {
    describe('when getHello is called', () => {
      it('should return the greeting message from the service', () => {
        // Given
        const expectedMessage = 'Hello World!';
        jest.spyOn(appService, 'getHello').mockReturnValue(expectedMessage);

        // When
        const result = appController.getHello();

        // Then
        expect(appService.getHello).toHaveBeenCalledTimes(1);
        expect(result).toBe(expectedMessage);
      });
    });

    describe('when service returns different message', () => {
      it('should return the custom message from the service', () => {
        // Given
        const customMessage = 'Custom greeting!';
        jest.spyOn(appService, 'getHello').mockReturnValue(customMessage);

        // When
        const result = appController.getHello();

        // Then
        expect(appService.getHello).toHaveBeenCalledTimes(1);
        expect(result).toBe(customMessage);
      });
    });
  });
});
