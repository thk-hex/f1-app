# --- Build Stage ---
    FROM node:lts as builder

    # Set working directory
    WORKDIR .
    
    COPY package*.json ./
    RUN npm ci
    
    COPY . .
    RUN npm run build
    
    # --- Runtime Stage ---
    FROM node:lts-slim
    
    WORKDIR .
    
    COPY --from=builder ./package*.json ./
    COPY --from=builder /node_modules ./node_modules
    COPY --from=builder /dist ./dist
    
    EXPOSE 3000
    ENV NODE_ENV production
    RUN adduser --system --group appuser
    USER appuser
    CMD [ "node", "dist/main" ]