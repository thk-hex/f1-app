# --- Build Stage ---
FROM node:lts as builder

# Set working directory
WORKDIR /app
    
COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate
    
COPY . .

RUN npm run build

# --- Runtime Stage ---
FROM node:lts-slim
    
WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl
    
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
    
EXPOSE 3000
ENV NODE_ENV production
RUN adduser --system --group appuser
USER appuser

CMD ["node", "dist/src/main.js"]