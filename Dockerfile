# Stage 1: Builder
FROM node:20-alpine AS builder

# Install build tools for native dependencies (like bcrypt)
RUN apk add --no-cache python3 make g++ 

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev tools)
RUN npm ci

# Copy application source
COPY . .

# Stage 2: Production environment
FROM node:20-alpine

WORKDIR /app

# Copy node_modules and source from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start command
CMD ["npm", "start"]
