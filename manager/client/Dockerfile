# Stage 1: Build the frontend application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy the rest of the application source code
COPY . .

# Build the application for production
# Ensure your package.json has a "build" script
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:1.25-alpine

# Copy the built application from the builder stage to Nginx's serve directory
COPY --from=builder /app/build /usr/share/nginx/html

# Copy a custom Nginx configuration (optional, but recommended for SPAs)
# Create a file named nginx.conf in the same directory as this Dockerfile
# (See example in customer/customer/Dockerfile or employee/client/Dockerfile)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
