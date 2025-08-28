
# # --------- Build frontend ---------
# FROM node:20-alpine AS frontend-build
# WORKDIR /app/frontend
# COPY frontend/package.json frontend/package-lock.json ./
# RUN npm ci
# COPY frontend/ ./
# RUN npm run build

# --------- Build backend ---------
FROM node:20-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# --------- Production image ---------
FROM node:20-alpine AS backend-runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy backend build
COPY --from=backend-build /app/backend /app/backend

# Install only production dependencies
WORKDIR /app/backend
RUN npm ci --omit=dev

# --------- Nginx for frontend ---------
# FROM nginx:alpine AS runtime
# COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html
# COPY --from=backend-runtime /app/backend /app/backend

# Expose ports: 80 for frontend, 4000 for backend
EXPOSE 80 4000

# Start both backend and nginx
CMD ["sh", "-c", "node /app/backend/dist/app.js"]
