# ==========================================
# Stage 1: Build Angular Application
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Build production bundle
RUN npm run build -- --configuration production

# ==========================================
# Stage 2: Nginx Web Server
# ==========================================
FROM nginx:1.27-alpine

# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled Angular app from builder
COPY --from=builder /app/dist/il-veliero-frontend /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
