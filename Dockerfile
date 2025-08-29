
# --------- Build backend ---------
FROM node:20-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm install
COPY backend/ ./
RUN npm run build

# --------- Build frontend ---------
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# --------- Production image ---------
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Install serve globally
RUN npm install -g serve

# Copy backend build
COPY --from=backend-build /app/backend /app/backend

# Copy frontend build into /app/frontend/dist
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Install only production dependencies for backend
WORKDIR /app/backend
RUN npm ci --omit=dev

# Expose ports: 80 for frontend, 4000 for backend
EXPOSE 80 4000

# Start both backend and serve for frontend
CMD ["sh", "-c", "node /app/backend/dist/app.js & serve -s /app/frontend/dist -l 80"]