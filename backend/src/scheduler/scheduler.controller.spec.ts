import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';

describe('SchedulerController', () => {
  let controller: SchedulerController;
  let mockSchedulerService: jest.Mocked<SchedulerService>;

  beforeEach(async () => {
    mockSchedulerService = {
      triggerManualUpdate: jest.fn(),
      getNextScheduledRun: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchedulerController],
      providers: [
        {
          provide: SchedulerService,
          useValue: mockSchedulerService,
        },
      ],
    }).compile();

    controller = module.get<SchedulerController>(SchedulerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('triggerUpdate', () => {
    it('should trigger manual update successfully', async () => {
      mockSchedulerService.triggerManualUpdate.mockResolvedValue();

      const result = await controller.triggerUpdate();

      expect(result).toEqual({
        message: 'F1 data update completed successfully',
        timestamp: expect.any(String),
      });
      expect(mockSchedulerService.triggerManualUpdate).toHaveBeenCalled();
    });

    it('should handle errors during manual update', async () => {
      mockSchedulerService.triggerManualUpdate.mockRejectedValue(
        new Error('Update failed'),
      );

      await expect(controller.triggerUpdate()).rejects.toThrow('Update failed');
      expect(mockSchedulerService.triggerManualUpdate).toHaveBeenCalled();
    });
  });

  describe('getNextRun', () => {
    it('should return next scheduled run time', async () => {
      const nextRunDate = new Date('2024-01-08T12:00:00.000Z'); // A Monday
      mockSchedulerService.getNextScheduledRun.mockReturnValue(nextRunDate);

      const result = await controller.getNextRun();

      expect(result).toEqual({
        nextRun: nextRunDate.toISOString(),
        cronExpression: '0 12 * * 1',
        timezone: 'UTC',
        description: 'Every Monday at 12:00 PM UTC',
      });
      expect(mockSchedulerService.getNextScheduledRun).toHaveBeenCalled();
    });
  });

  describe('getStatus', () => {
    it('should return scheduler status information', async () => {
      const nextRunDate = new Date('2024-01-08T12:00:00.000Z'); // A Monday
      mockSchedulerService.getNextScheduledRun.mockReturnValue(nextRunDate);

      const result = await controller.getStatus();

      expect(result).toEqual({
        enabled: true,
        nextRun: nextRunDate.toISOString(),
        cronExpression: '0 12 * * 1',
        timezone: 'UTC',
        description: 'Weekly F1 data update - Every Monday at 12:00 PM UTC',
        lastRunStatus: 'Check application logs for detailed run history',
      });
      expect(mockSchedulerService.getNextScheduledRun).toHaveBeenCalled();
    });
  });
}); 