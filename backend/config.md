# Environment Variables Configuration

This document lists all environment variables needed for the F1 Champions Backend application.

## Required Environment Variables

### Database Configuration
- `DATABASE_URL`: PostgreSQL connection string (automatically provided by Render PostgreSQL)
  - Format: `postgresql://username:password@host:port/database?schema=public`

### Redis Configuration
- `REDIS_URL`: Redis connection string (automatically provided by Render Redis)
  - Format: `redis://user:password@host:port`
  - Used for caching to improve API performance

### Application Configuration
- `NODE_ENV`: Application environment (`development`, `production`)
- `PORT`: Port number for the application (default: 3000)

### CORS Configuration
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins for CORS
  - Development: `"*"` (allow all)
  - Production: Your frontend domain(s)

### F1 API Configuration (for data seeding)
- `BASE_URL`: Base URL for F1 API endpoints (optional, for seeding)
- `GP_START_YEAR`: Starting year for Grand Prix data (optional, default: 2005)

### Optional Configurations
- `JWT_SECRET`: Secret key for JWT tokens (if using authentication)
- `BCRYPT_ROUNDS`: Number of bcrypt rounds (if using password hashing)

## Render Environment Variables Setup

In your Render dashboard, you'll need to set:

1. `NODE_ENV` = `production` (for prod) or `development` (for dev)
2. `PORT` = `3000`
3. `DATABASE_URL` = (automatically set by connecting PostgreSQL database)
4. `REDIS_URL` = (automatically set by connecting Redis database)
5. `ALLOWED_ORIGINS` = your frontend URLs

Optional variables can be added as needed based on your application features.

## Services Created by render.yaml

The blueprint will create:

### Databases:
- `f1-app-db-prod` - Production PostgreSQL database
- `f1-app-db-dev` - Development PostgreSQL database
- `f1-app-redis-prod` - Production Redis cache
- `f1-app-redis-dev` - Development Redis cache

### Web Services:
- `f1-app-backend-prod` - Production backend API
- `f1-app-backend-dev` - Development backend API
- `f1-app-pgadmin` - Database administration interface

### pgAdmin Access:
- **URL**: `https://f1-app-pgadmin.onrender.com`
- **Email**: `admin@f1app.local`
- **Password**: `supersecurepassword123`

**Note**: Change the pgAdmin password after first login for security!

All services are configured on the free tier and will be automatically connected via environment variables. 