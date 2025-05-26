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
- `GET /race-winners/year`: Get a list of all race winners for a specific year

## API Documentation

The API is documented using OpenAPI (Swagger):

- **Swagger UI**: Access interactive API documentation at `http://localhost:3000/api`
- **OpenAPI YAML**: Get the OpenAPI specification in YAML format at `http://localhost:3000/api-yaml`
- **OpenAPI JSON**: Get the OpenAPI specification in JSON format at `http://localhost:3000/api-json`

You can use the OpenAPI YAML/JSON to generate client code for your frontend application.

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

## Trade-offs
1. The DB seed script fetches champion data from the API before the backend instance launches. If the requirement changes to accommodate a larger dataset, fetching from the API can be disabled. The seed script can then populate only the years without actual data, which will reduce app launch time.