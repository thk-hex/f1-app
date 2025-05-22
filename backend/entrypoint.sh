#!/bin/sh
set -e

# Generate Prisma client if needed
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Start the application
exec "$@" 