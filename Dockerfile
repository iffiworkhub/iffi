# -------------------------------
# 1. Build Stage
# -------------------------------
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Build the Vite project
RUN npm run build


# -------------------------------
# 2. Production Stage (NGINX)
# -------------------------------
FROM nginx:alpine

# Remove default NGINX HTML files
RUN rm -rf /usr/share/nginx/html/*

# Copy build output from Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
