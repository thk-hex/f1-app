import { Controller, Post, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SchedulerService } from './scheduler.service';

@ApiTags('Scheduler')
@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Post('trigger-update')
  @ApiOperation({
    summary: 'Manually trigger F1 data update',
    description:
      'Triggers the same data update process that runs automatically every Monday at 12 PM UTC',
  })
  @ApiResponse({
    status: 200,
    description: 'Update triggered successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        timestamp: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Update failed',
  })
  async triggerUpdate() {
    try {
      await this.schedulerService.triggerManualUpdate();
      return {
        message: 'F1 data update completed successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('next-run')
  @ApiOperation({
    summary: 'Get next scheduled run time',
    description:
      'Returns the date and time of the next automated F1 data update',
  })
  @ApiResponse({
    status: 200,
    description: 'Next scheduled run time',
    schema: {
      type: 'object',
      properties: {
        nextRun: { type: 'string' },
        cronExpression: { type: 'string' },
        timezone: { type: 'string' },
        description: { type: 'string' },
      },
    },
  })
  async getNextRun() {
    const nextRun = this.schedulerService.getNextScheduledRun();

    return {
      nextRun: nextRun.toISOString(),
      cronExpression: '0 12 * * 1',
      timezone: 'UTC',
      description: 'Every Monday at 12:00 PM UTC',
    };
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get scheduler status',
    description:
      'Returns information about the scheduler and its configuration',
  })
  @ApiResponse({
    status: 200,
    description: 'Scheduler status information',
    schema: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        nextRun: { type: 'string' },
        cronExpression: { type: 'string' },
        timezone: { type: 'string' },
        lastRunStatus: { type: 'string' },
      },
    },
  })
  async getStatus() {
    const nextRun = this.schedulerService.getNextScheduledRun();

    return {
      enabled: true,
      nextRun: nextRun.toISOString(),
      cronExpression: '0 12 * * 1',
      timezone: 'UTC',
      description: 'Weekly F1 data update - Every Monday at 12:00 PM UTC',
      lastRunStatus: 'Check application logs for detailed run history',
    };
  }
}
