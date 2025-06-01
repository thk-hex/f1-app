# F1 Data Scheduler Module

## Overview

The Scheduler module provides automated updates for F1 Champions and Race Winners data. It runs scheduled tasks using NestJS's built-in scheduling capabilities powered by cron jobs.

## Features

- **Automated Weekly Updates**: Runs every Monday at 12:00 PM UTC
- **Manual Trigger**: API endpoints to manually trigger updates
- **Cache Management**: Automatically clears cache before updates
- **Force Refresh**: Always fetches from external API to ensure data completeness
- **Missing Data Detection**: Detects and updates missing races or champions
- **Error Handling**: Robust error handling with detailed logging
- **Status Monitoring**: Endpoints to check scheduler status and next run time

## Scheduling

### Cron Expression
- **Pattern**: `0 12 * * 1`
- **Description**: Every Monday at 12:00 PM UTC
- **Timezone**: UTC

### What Gets Updated

1. **Champions Data**: All F1 World Champions from the configured start year to current year
2. **Race Winners Data**: Race winners for the last 3 years (for efficiency)

## API Endpoints

### 1. Manual Trigger
```http
POST /scheduler/trigger-update
```
Manually triggers the same data update process that runs automatically every Monday.

**Response:**
```json
{
  "message": "F1 data update completed successfully",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### 2. Next Run Time
```http
GET /scheduler/next-run
```
Returns the date and time of the next automated F1 data update.

**Response:**
```json
{
  "nextRun": "2024-01-22T12:00:00.000Z",
  "cronExpression": "0 12 * * 1",
  "timezone": "UTC",
  "description": "Every Monday at 12:00 PM UTC"
}
```

### 3. Scheduler Status
```http
GET /scheduler/status
```
Returns information about the scheduler and its configuration.

**Response:**
```json
{
  "enabled": true,
  "nextRun": "2024-01-22T12:00:00.000Z",
  "cronExpression": "0 12 * * 1",
  "timezone": "UTC",
  "description": "Weekly F1 data update - Every Monday at 12:00 PM UTC",
  "lastRunStatus": "Check application logs for detailed run history"
}
```

## Update Process

### 1. Cache Clearing
- Clears Champions cache
- Clears Race Winners cache for all years from start year to current year

### 2. Champions Update
- **Force refresh** from external F1 API (bypasses database checks)
- Fetches ALL championship data from configured start year to current year
- Updates database with new/changed champion data (upserts existing records)
- Detects and adds any missing championship data
- Caches results in Redis

### 3. Race Winners Update
- **Force refresh** from external F1 API for each year (bypasses database checks)
- Updates race winners for last 3 years (configurable)
- Fetches ALL race data for each year from external F1 API
- Updates database with new/changed race data (upserts existing records)
- Detects and adds any missing race data (e.g., newly completed races)
- Caches results in Redis
- Includes rate limiting between API calls

## Configuration

The scheduler uses the following environment variables:

- `GP_START_YEAR`: Starting year for F1 data (defaults to 2005)
- `BASE_URL`: F1 API base URL

## Logging

The scheduler provides detailed logging for:

- Start/completion of scheduled updates
- Individual year processing for race winners
- Cache clearing operations
- Error handling and recovery
- Performance metrics (number of records updated)

## Error Handling

- **Graceful Degradation**: If one year fails, continues with other years
- **Cache Resilience**: Update continues even if cache clearing fails
- **Detailed Error Logging**: All errors are logged with stack traces
- **Service Independence**: Champions and race winners updates are independent

## Development

### Testing the Scheduler

1. **Manual Trigger**: Use the `/scheduler/trigger-update` endpoint
2. **Check Logs**: Monitor application logs for detailed execution info
3. **Verify Data**: Check that cache is cleared and database is updated

### Modifying Schedule

To change the schedule, modify the cron expression in `SchedulerService`:

```typescript
@Cron('0 12 * * 1', {  // Current: Every Monday at 12 PM UTC
  name: 'updateF1Data',
  timeZone: 'UTC',
})
```

### Common Cron Patterns
- Every hour: `0 * * * *`
- Every day at midnight: `0 0 * * *`
- Every week on Sunday at 2 AM: `0 2 * * 0`
- Every month on 1st at midnight: `0 0 1 * *`

## Dependencies

- `@nestjs/schedule`: NestJS scheduling module
- `@nestjs/common`: Common NestJS utilities
- `@nestjs/config`: Configuration management

## Architecture

```
SchedulerModule
├── SchedulerService (Cron jobs and business logic)
├── SchedulerController (API endpoints)
└── Dependencies:
    ├── ChampionsService (For updating champions data)
    ├── RaceWinnersService (For updating race winners data)
    └── CacheService (For cache management)
```

## Performance Considerations

- **Rate Limiting**: Built-in delays between API calls to avoid overwhelming external APIs
- **Efficient Updates**: Only updates last 3 years for race winners to balance freshness with performance
- **Cache Strategy**: Clears cache before updates to ensure fresh data
- **Error Recovery**: Continues processing even if individual operations fail

## Monitoring

Monitor the scheduler by:

1. **Application Logs**: Check for scheduled job execution logs
2. **API Endpoints**: Use status endpoints to verify scheduler state
3. **Database Updates**: Verify that data is being updated as expected
4. **Cache Performance**: Monitor cache hit rates after updates 