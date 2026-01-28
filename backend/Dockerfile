FROM node:20-bookworm-slim

# Force rebuild: 2026-01-28
# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    python3-venv \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN pip3 install --no-cache-dir --break-system-packages yt-dlp

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev for TypeScript build)
RUN npm install --production=false

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Start the server
CMD ["npm", "start"]
