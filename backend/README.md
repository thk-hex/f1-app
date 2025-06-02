# F1 Champions Backend

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## Description

This is the backend service for the F1 Champions application. It provides data about Formula 1 champions across different seasons using modern Node.js technologies and best practices.

## 🏗️ Architecture & Approach

### Clean Architecture
The project follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── champions/          # Champions domain module
├── race-winners/       # Race winners domain module
├── cache/             # Cache management module
├── scheduler/         # Automated data updates
├── prisma/           # Database layer
├── shared/           # Shared utilities
└── app.module.ts     # Main application module
```

### Design Patterns
- **Module Pattern**: Each feature is encapsulated in its own NestJS module
- **Repository Pattern**: Data access abstraction through Prisma
- **Dependency Injection**: Leveraging NestJS's powerful DI container
- **Decorator Pattern**: Extensive use of TypeScript decorators for metadata
- **Strategy Pattern**: Different caching strategies for different data types

### Key Architectural Decisions

#### 1. **NestJS Framework**
- **Modular Architecture**: Each domain has its own module with clear boundaries
- **Dependency Injection**: Built-in IoC container for loose coupling
- **Decorator-based**: Metadata-driven development with TypeScript decorators
- **Express.js Foundation**: Battle-tested HTTP server underneath

#### 2. **Database Strategy**
- **PostgreSQL**: Robust relational database for structured F1 data
- **Prisma ORM**: Type-safe database client with automatic migrations
- **Schema-first Approach**: Database schema drives TypeScript types

#### 3. **Caching Strategy**
- **Redis**: High-performance in-memory caching
- **Multi-level Caching**: API-level and database query-level caching
- **Cache Invalidation**: Smart cache clearing on data updates
- **TTL Management**: Time-based cache expiration

## 🛠️ Technologies & Libraries

### Core Framework
- **[NestJS](https://nestjs.com/)**: Progressive Node.js framework for scalable server-side applications
- **[TypeScript](https://www.typescriptlang.org/)**: Typed superset of JavaScript for better developer experience

### Database & ORM
- **[PostgreSQL](https://www.postgresql.org/)**: Advanced open-source relational database
- **[Prisma](https://www.prisma.io/)**: Next-generation ORM with type safety and auto-completion
- **[Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)**: Database schema migration tool

### Caching & Performance
- **[Redis](https://redis.io/)**: In-memory data structure store for caching
- **[@nestjs/cache-manager](https://docs.nestjs.com/techniques/caching)**: NestJS caching integration
- **[cache-manager](https://www.npmjs.com/package/cache-manager)**: Flexible caching library
- **[@keyv/redis](https://www.npmjs.com/package/@keyv/redis)**: Redis adapter for Keyv

### HTTP & API
- **[Axios](https://axios-http.com/)**: Promise-based HTTP client for external API calls
- **[@nestjs/axios](https://docs.nestjs.com/techniques/http-module)**: NestJS Axios integration
- **[Express.js](https://expressjs.com/)**: Fast, unopinionated web framework (underlying NestJS)

### Documentation & Validation
- **[@nestjs/swagger](https://docs.nestjs.com/openapi/introduction)**: OpenAPI/Swagger documentation generation
- **[class-validator](https://github.com/typestack/class-validator)**: Decorator-based validation
- **[class-transformer](https://github.com/typestack/class-transformer)**: Object transformation utilities

### Scheduling & Background Jobs
- **[@nestjs/schedule](https://docs.nestjs.com/techniques/task-scheduling)**: Cron job and task scheduling
- **[node-cron](https://www.npmjs.com/package/node-cron)**: Task scheduler for background processes

### Development & Testing
- **[Jest](https://jestjs.io/)**: JavaScript testing framework
- **[ESLint](https://eslint.org/)**: Code linting and style enforcement
- **[Prettier](https://prettier.io/)**: Code formatting
- **[ts-node](https://typestrong.org/ts-node/)**: TypeScript execution environment

## 🏆 Best Practices Implemented

### 1. **Code Quality & Standards**
- **TypeScript Strict Mode**: Enhanced type safety and error prevention
- **ESLint + Prettier**: Consistent code formatting and style
- **Conventional Commits**: Standardized commit message format
- **Code Reviews**: Mandatory peer review process

### 2. **API Design**
- **RESTful Architecture**: Standard HTTP methods and status codes
- **OpenAPI Documentation**: Comprehensive API documentation with Swagger
- **Versioning Strategy**: Future-proof API versioning approach
- **Error Handling**: Consistent error response format

### 3. **Database Best Practices**
- **Migration-based Schema**: Version-controlled database changes
- **Indexing Strategy**: Optimized database queries with proper indexes
- **Connection Pooling**: Efficient database connection management
- **Transaction Management**: ACID compliance for data integrity

### 4. **Security**
- **Input Validation**: Comprehensive request validation using class-validator
- **Environment Variables**: Secure configuration management
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Rate Limiting**: Protection against API abuse (planned)

### 5. **Performance Optimization**
- **Redis Caching**: Reduced database load and faster response times
- **Query Optimization**: Efficient database queries with Prisma
- **Compression**: HTTP response compression for better bandwidth usage
- **Connection Pooling**: Optimized database connection management

### 6. **Monitoring & Observability**
- **Structured Logging**: Consistent log format for better debugging
- **Health Checks**: Application health monitoring endpoints
- **Error Tracking**: Comprehensive error logging and tracking
- **Performance Metrics**: API response time monitoring

### 7. **DevOps & Deployment**
- **Docker Support**: Containerized application for consistent deployments
- **Environment Configuration**: Flexible environment-based configuration
- **CI/CD Ready**: GitHub Actions workflow support
- **Database Seeding**: Automated initial data population

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
- **Updates**: Champions data and race winners for recent years
- **Force Refresh**: Always fetches from external API to ensure data completeness
- **Missing Data Detection**: Detects and updates missing races or champions
- **Cache Management**: Automatically clears cache before updates
- **Manual Control**: Use `/scheduler/trigger-update` for manual updates
- **Monitoring**: Check `/scheduler/status` for scheduler information

The scheduler ensures that your F1 data stays current and complete without manual intervention, even if individual races or champions are missing from the database.

## Implementation Details

### Champions Module
1. On first request, it checks if data exists in the database
2. If no data is found, it fetches from the external API with rate limiting
3. The fetched data is stored in the database for future requests
4. Subsequent requests are served directly from the database

### Race Winners Module
1. Data is stored per season in the database
2. The API endpoint accepts a year parameter to fetch race winners for that season
3. Rate limiting is applied to external API requests to avoid hitting rate limits

### Scheduler Module
1. Runs automated updates every Monday at 12:00 PM UTC
2. Clears cache before updating to ensure fresh data
3. **Force refreshes** Champions data from the configured start year to current year
4. **Force refreshes** Race Winners data for the last 3 years (configurable)
5. Always fetches from external API to detect missing or new data
6. Uses upsert operations to update existing records and add missing ones
7. Includes rate limiting and error handling for resilient operation
8. Provides API endpoints for manual triggering and status monitoring

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

## 📊 Performance Considerations

### Caching Strategy
- **Champions Data**: Cached for 24 hours (low volatility)
- **Race Winners**: Cached for 6 hours (seasonal updates)
- **API Responses**: Edge caching for frequently requested data
- **Database Queries**: Query result caching with smart invalidation

### Rate Limiting
- **External API**: Respectful rate limiting to Ergast F1 API
- **Client Requests**: Protection against API abuse
- **Retry Logic**: Exponential backoff for failed requests

### Database Optimization
- **Indexing**: Strategic indexes on frequently queried columns
- **Connection Pooling**: Optimized connection management
- **Query Optimization**: Efficient Prisma queries with proper relations

## 🧪 Testing Strategy

### Unit Tests
- **Service Layer**: Business logic testing
- **Controller Layer**: HTTP endpoint testing
- **Repository Layer**: Data access testing
- **Utility Functions**: Helper function testing

### Integration Tests
- **Database Integration**: End-to-end database operations
- **External API Integration**: Mock external service interactions
- **Cache Integration**: Redis cache behavior testing

### Test Coverage
- **Minimum Coverage**: 80% test coverage requirement
- **Critical Paths**: 100% coverage for core business logic
- **Automated Reporting**: Coverage reports in CI/CD pipeline

## 🔧 Configuration

### Environment-based Configuration
```typescript
// config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    url: process.env.DATABASE_URL,
  },
  f1Api: {
    baseUrl: process.env.BASE_URL,
    startYear: parseInt(process.env.GP_START_YEAR, 10) || 2005,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
});
```

## 🚀 Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Redis cache accessible
- [ ] Health checks responding
- [ ] Monitoring configured
- [ ] Backup strategy implemented

### Scaling Considerations
- **Horizontal Scaling**: Stateless design for multiple instances
- **Load Balancing**: Ready for load balancer integration
- **Database Scaling**: Read replicas for high-traffic scenarios
- **Cache Scaling**: Redis cluster support for large datasets

## Trade-offs

### Current Implementation
1. **Database Seeding**: The DB seed script fetches champion data from the API before the backend instance launches. If the requirement changes to accommodate a larger dataset, fetching from the API can be disabled. The seed script can then populate only the years without actual data, which will reduce app launch time.

2. **Memory vs. Storage**: Heavy use of Redis caching trades memory usage for faster response times
3. **Consistency vs. Performance**: Eventually consistent cache updates for better performance
4. **Simplicity vs. Flexibility**: Current implementation prioritizes simplicity over complex configuration options

### Future Improvements
- **Microservices**: Consider splitting into domain-specific services for larger scales
- **Event Sourcing**: Implement event-driven architecture for better auditability
- **GraphQL**: Consider GraphQL for more flexible client data requirements
- **Real-time Updates**: WebSocket support for live data updates