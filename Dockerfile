# FROM node:20-alpine AS base

# RUN apk add --no-cache \
#     chromium \
#     nss \
#     freetype \
#     harfbuzz \
#     ca-certificates \
#     ttf-freefont

# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
#     PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# WORKDIR /app
# COPY package*.json ./
# RUN npm ci --only=production

# COPY . .

# EXPOSE 3000
# CMD ["npm", "start"]



FROM node:20-alpine AS base

# Install Chromium for pdf/puppeteer if needed
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

# Default command (will be overridden by App Spec)
CMD ["npm", "run", "start:prod", "start:worker:prod"]