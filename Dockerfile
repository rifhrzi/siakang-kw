# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install nginx and supervisor
RUN apk add --no-cache nginx supervisor

# Copy package files for production deps only
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built frontend from builder
COPY --from=builder /app/dist ./dist

# Copy server code
COPY server ./server

# Copy nginx config
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy supervisor config
COPY supervisord.conf /etc/supervisord.conf

# Expose port
EXPOSE 80

# Start supervisor (manages both nginx and node)
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
