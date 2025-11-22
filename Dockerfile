# Multi-stage build for React frontend and Node.js backend

# Stage 1: Build the React frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Stage 2: Setup the Node.js backend
FROM node:18-alpine AS backend

WORKDIR /app

# Copy backend package files
COPY server/package*.json ./server/

# Install backend dependencies
RUN cd server && npm ci --only=production

# Copy backend source
COPY server/ ./server/

# Copy built frontend from previous stage
COPY --from=frontend-build /app/dist ./dist

# Expose port
EXPOSE 4000

# Set environment variables
ENV NODE_ENV=production

# Start the server
CMD ["node", "server/index.js"]