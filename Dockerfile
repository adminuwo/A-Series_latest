FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .



# Build the application
RUN npm run build

# Expose the port (default to 8080)
ENV PORT=8080
EXPOSE 8080

# Start the application
CMD ["npm", "run", "start"]
