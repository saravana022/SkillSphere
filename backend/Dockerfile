# Production Dockerfile for SkillSphere Backend
FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies if needed
# RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --only=production

COPY . .

# Final stage
FROM node:20-slim

WORKDIR /app

# Install PM2 globally
RUN npm install pm2 -g

# Create non-root user
RUN groupadd -r nodeuser && useradd -r -g nodeuser -m nodeuser
RUN chown -R nodeuser:nodeuser /app /home/nodeuser

# Copy from builder
COPY --from=builder --chown=nodeuser:nodeuser /app /app

USER nodeuser

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => res.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["pm2-runtime", "ecosystem.config.js"]
