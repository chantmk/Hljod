# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer cache)
COPY package.json ./
RUN npm install

# Copy source and build
COPY . .

# Build arg allows overriding the API URL at build time
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ─── Stage 2: Serve ───────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built React app from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/templates/default.conf.template

# nginx will use envsubst on startup to substitute $API_URL in the config
# Default if not provided
ENV API_URL=http://nas.local:8000

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
