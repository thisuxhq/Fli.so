# Use Bun as the base image
FROM oven/bun:latest

# Set the working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy the rest of the application files
COPY . .

# Build the application
RUN bun run build

# Expose port 5173 for the application
EXPOSE 5173

# Set command to run the development server
# Using 'dev' instead of 'start' since PocketBase runs in its own container
CMD ["bun", "run", "dev", "--host", "0.0.0.0"]
