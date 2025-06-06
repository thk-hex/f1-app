# --- Build Stage ---
FROM node:lts-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files AND prisma schema first
COPY package*.json ./
COPY prisma ./prisma

# Install ALL dependencies (including dev) for building
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# --- Runtime Stage ---
FROM node:lts-alpine

# Install necessary packages for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy package files and prisma schema for production install
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Install only production dependencies (postinstall can now find prisma schema)
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --eval "require('http').get('http://localhost:3000/api', (res) => process.exit(res.statusCode === 200 ? 0 : 1))" || exit 1

# Start command with database migration
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]