# Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src/prisma ./src/prisma
COPY prisma.config.ts ./
RUN npx prisma generate
COPY . .
RUN npm run build

# Production
FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache wget

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY prisma.config.ts ./
COPY src/prisma ./src/prisma
COPY src/public ./src/public

ENV NODE_ENV=production PORT=8888
EXPOSE 8888

# Start application (run migrations first, then start server)
CMD npx prisma migrate deploy && node dist/index.js
