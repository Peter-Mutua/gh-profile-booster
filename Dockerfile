# Use a robust Debian-based image for Headless Chrome support
FROM node:18-slim

# Install Chromium and necessary system dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    git \
    chromium \
    procps \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use the installed Chromium instead of downloading its own
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Set the working directory
WORKDIR /usr/src/app

# Copy package files first
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy the rest of the application
COPY . .

# Expose the dashboard port
EXPOSE 3030

# Set environment
ENV NODE_ENV=production

# Command to run the application
CMD [ "node", "index.js" ]
