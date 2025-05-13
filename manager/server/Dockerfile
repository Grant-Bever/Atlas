# Stage 1: Build environment
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files for the server to the app root
COPY manager/server/package.json manager/server/package-lock.json* ./

# Install dependencies into /app/node_modules
RUN npm ci --omit=dev

# Copy source code AFTER npm ci to leverage Docker cache effectively
COPY common/. ./common/
COPY manager/server/. ./manager/server/

# Stage 2: Production environment
FROM node:18-alpine AS production

WORKDIR /app

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code from builder
COPY --from=builder /app/common ./common
COPY --from=builder /app/manager/server ./manager/server

# Set the final working directory to where server.js is
WORKDIR /app/manager/server

EXPOSE 3002

CMD ["node", "server.js"]
