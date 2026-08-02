# syntax=docker/dockerfile:1
FROM node:24-bookworm

# Install dependencies for Chromium, ffmpeg, VOICEVOX, and PSD processing
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    python3 \
    python3-pip \
    python3-venv \
    jq \
    ffmpeg \
    # Chromium dependencies for Remotion
    libnss3 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libcairo2 \
    libatspi2.0-0 \
    libgtk-3-0 \
    fonts-noto-cjk \
    fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*

# Install psd-tools for PSD file processing
RUN pip3 install --break-system-packages psd-tools Pillow

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy project files
COPY . .

# Expose Remotion dev server port
EXPOSE 3000

# Default command
CMD ["npm", "run", "dev"]
