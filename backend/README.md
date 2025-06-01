# F1 Champions Backend

## Description

This is the backend service for the F1 Champions application. It provides data about Formula 1 champions across different seasons.

## Environment Variables

The application requires the following environment variables:

- `BASE_URL`: The base URL for the Ergast F1 API (e.g., `https://api.jolpi.ca/ergast/f1`)
- `GP_START_YEAR`: The starting year for fetching F1 champions data (optional, defaults to 2005)
  - **Valid range**: 1950 (when F1 World Championship started) to current year
  - **Validation**: The application will return a 400 Bad Request error if GP_START_YEAR is outside this range
- `DATABASE_URL`: PostgreSQL connection string

## Database Setup

The application uses PostgreSQL as its database. Before running the application, make sure you have PostgreSQL installed and running.

```bash
# Generate Prisma client
$ npm run prisma:generate

# Run migrations
$ npm run prisma:migrate

# Open Prisma Studio
$ npm run prisma:studio

# Seed the database
$ npm run db:seed
```

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Endpoints

- `GET /champions`: Get a list of all F1 champions
- `GET /race-winners/:year`: Get a list of all race winners for a specific year

### Scheduler Endpoints

- `POST /scheduler/trigger-update`: Manually trigger F1 data update
- `GET /scheduler/next-run`: Get next scheduled update time
- `GET /scheduler/status`: Get scheduler status and configuration

### Cache Management

- `GET /cache/health`: Check cache health status
- `GET /cache/stats`: Get cache statistics
- `DELETE /cache/champions`: Clear champions cache
- `DELETE /cache/race-winners/:year`: Clear race winners cache for specific year
- `DELETE /cache/race-winners`: Clear all race winners cache

## API Documentation

The API is documented using OpenAPI (Swagger):

- **Swagger UI**: Access interactive API documentation at `http://localhost:3000/api`
- **OpenAPI YAML**: Get the OpenAPI specification in YAML format at `http://localhost:3000/api-yaml`
- **OpenAPI JSON**: Get the OpenAPI specification in JSON format at `http://localhost:3000/api-json`

You can use the OpenAPI YAML/JSON to generate client code for your frontend application.

## Automated Data Updates

The application includes an automated scheduler that keeps F1 data up-to-date:

- **Schedule**: Every Monday at 12:00 PM UTC
- **Updates**: Champions data and race winners for recent years
- **Force Refresh**: Always fetches from external API to ensure data completeness
- **Missing Data Detection**: Detects and updates missing races or champions
- **Cache Management**: Automatically clears cache before updates
- **Manual Control**: Use `/scheduler/trigger-update` for manual updates
- **Monitoring**: Check `/scheduler/status` for scheduler information

The scheduler ensures that your F1 data stays current and complete without manual intervention, even if individual races or champions are missing from the database.

## Implementation Details

The Champions module:
1. On first request, it checks if data exists in the database
2. If no data is found, it fetches from the external API with rate limiting
3. The fetched data is stored in the database for future requests
4. Subsequent requests are served directly from the database

The Race Winners module:
1. Data is stored per season in the database
2. The API endpoint accepts a year parameter to fetch race winners for that season
3. Rate limiting is applied to external API requests to avoid hitting rate limits

The Scheduler module:
1. Runs automated updates every Monday at 12:00 PM UTC
2. Clears cache before updating to ensure fresh data
3. **Force refreshes** Champions data from the configured start year to current year
4. **Force refreshes** Race Winners data for the last 3 years (configurable)
5. Always fetches from external API to detect missing or new data
6. Uses upsert operations to update existing records and add missing ones
7. Includes rate limiting and error handling for resilient operation
8. Provides API endpoints for manual triggering and status monitoring

## Trade-offs
1. The DB seed script fetches champion data from the API before the backend instance launches. If the requirement changes to accommodate a larger dataset, fetching from the API can be disabled. The seed script can then populate only the years without actual data, which will reduce app launch time.