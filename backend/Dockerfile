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
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh
    
EXPOSE 3000
ENV NODE_ENV production

# Add a system user
RUN adduser --system --group appuser

# Give permissions to the appuser
RUN chown -R appuser:appuser /app

# Switch to the appuser
USER appuser

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "dist/src/main.js"]