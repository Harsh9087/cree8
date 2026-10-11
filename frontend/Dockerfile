# Development stage
FROM node:20-alpine AS development

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Expose Vite development server port
EXPOSE 5173

CMD ["npm", "run", "dev"]

# Build stage for production
FROM development AS build
RUN npm run build

# Production stage using Nginx
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
