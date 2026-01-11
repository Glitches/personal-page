FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build the site
RUN npm run build

# Expose port for serving (optional, for dev)
EXPOSE 3000

# Default command: serve the built site
CMD ["npx", "serve", "dist", "-l", "3000"]
