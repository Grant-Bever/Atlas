# Stage 1: Build environment
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files FOR THE SERVER from the correct location
COPY manager/server/package.json manager/server/package-lock.json* ./manager/server/

# Copy common directory required by the server
COPY common/. ./common/

# Change working directory to the server directory to install its specific dependencies
WORKDIR /app/manager/server
RUN npm ci --omit=dev

# Change back to the root app directory
WORKDIR /app

# Copy the rest of the server source code
COPY manager/server/. ./manager/server/

# Stage 2: Production environment
FROM node:18-alpine AS production

WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/manager/server/node_modules ./manager/server/node_modules
COPY --from=builder /app/common ./common
COPY --from=builder /app/manager/server ./manager/server

# Set the final working directory
WORKDIR /app/manager/server

# Expose the port the app runs on (Cloud Run sets this via PORT env var)
EXPOSE 3002

# Command to run the application, now relative to the server directory
CMD ["node", "server.js"]
