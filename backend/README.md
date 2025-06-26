# F1 Champions Backend

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## Description

This is the backend service for the F1 Champions application. It provides data about Formula 1 champions across different seasons using modern Node.js technologies.

## 🏗️ Architecture & Approach

### Key Architectural Decisions

#### 1. **NestJS Framework**
- **Modular Architecture**: Each domain has its own module with clear boundaries
- **Dependency Injection**: Built-in IoC container for loose coupling
- **Decorator-based**: Metadata-driven development with TypeScript decorators

#### 2. **Database Strategy**
- **PostgreSQL**: Robust relational database for structured F1 data
- **Prisma ORM**: Type-safe database client with automatic migrations
- **Schema-first Approach**: Database schema drives TypeScript types

#### 3. **Caching Strategy**
- **Redis**: High-performance in-memory caching
- **Multi-level Caching**: API-level and database query-level caching
- **Cache Invalidation**: Smart cache clearing on data updates
- **TTL Management**: Time-based cache expiration

## Environment Variables

The application requires the following environment variables:

- `BASE_URL`: The base URL for the Ergast F1 API (e.g., `https://api.jolpi.ca/ergast/f1`)
- `GP_START_YEAR`: The starting year for fetching F1 champions data
  - **Valid range**: 1950 (when F1 World Championship started) to current year
  - **Validation**: The application will return a 400 Bad Request error if GP_START_YEAR is outside this range
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: API's port
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port

## Database Setup

The application uses PostgreSQL as its database. Before running the application, make sure you have PostgreSQL installed and running.

```bash
# Generate Prisma client
$ npm run prisma:generate

# Run migrations
$ npm run prisma:migrate

# Seed the database (optional)
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

# test coverage
$ npm run test:cov
```

## API Endpoints

### Core Endpoints
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
- **Updates**: Champions data and race winners for last year

The scheduler ensures that your F1 data stays current and complete without manual intervention, even if individual races (last year) or champions are missing from the database.

## 🐳 Docker Support

### Development
```bash
# Build and run with Docker Compose
cd ../infrastructure
docker-compose up --build
```

### Production
```bash
# Build production image
docker build -t f1-backend .

# Run container
docker run -p 3000:3000 --env-file .env f1-backend
```

## Trade-offs

1. **Database Seeding**: The DB seed script fetches champion data from the API before the backend instance launches. If the requirement changes to accommodate a larger dataset, fetching from the API can be disabled. The seed script can then populate only the years without actual data, which will reduce app launch time.