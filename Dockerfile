FROM node:20-alpine

WORKDIR /usr/src/app

# Install dependencies first (use package-lock if present for reproducible installs)
COPY package*.json ./
RUN npm ci --only=production || npm install --production

# Copy application sources
COPY . .

# Expose preferred port. App Platform will set PORT env var at runtime.
ENV PORT=10000
EXPOSE 10000

# Default command
CMD ["node", "working.cjs"]
