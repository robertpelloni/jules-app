FROM node:20-alpine

# Install bash, git, and other common dev tools
RUN apk add --no-cache \
    bash \
    git \
    curl \
    vim \
    nano \
    python3 \
    py3-pip \
    build-base \
    linux-headers

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create workspace directory
RUN mkdir -p /workspace

# Set default shell to bash
ENV SHELL=/bin/bash

# Expose WebSocket port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start server
CMD ["node", "server.js"]
