# --- Build Stage ---
FROM node:lts as builder

# Set working directory
WORKDIR /app
    
COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate
    
COPY . .
# Debug: Show files before building
RUN ls -la
RUN npm run build
# Debug: Show build output
RUN ls -la dist/
    
# --- Runtime Stage ---
FROM node:lts-slim
    
WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl
    
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
    
# Debug: Show files in runtime container
RUN ls -la
RUN ls -la dist/ || echo "dist directory is missing or empty"
    
EXPOSE 3000
ENV NODE_ENV production
RUN adduser --system --group appuser
USER appuser

# Fix: Use the correct path to main.js
CMD ["node", "dist/src/main.js"]