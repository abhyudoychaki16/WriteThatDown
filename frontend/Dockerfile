# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy all config files that Vite/TS needs
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.* ./
COPY . .

RUN npm install
RUN npm run build

# Production stage using `serve`
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 80
CMD ["serve", "-s", "dist", "-l", "80"]