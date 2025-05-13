# Stage 1: Build environment
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy the rest of the application code
COPY . .

# Stage 2: Production environment
FROM node:18-alpine AS production

WORKDIR /app

# Copy dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules
# Copy application code from builder stage
COPY --from=builder /app ./

# Expose the port the app runs on (Cloud Run sets this via PORT env var)
# Defaulting to 3002 if PORT is not set, based on server.js
EXPOSE 3002

# Command to run the application
# Use the PORT environment variable provided by Cloud Run
CMD ["node", "server.js"]
