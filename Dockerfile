# Use Bun as the base image
FROM oven/bun

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN bun install

# Copy the rest of the application files
COPY . .

# Build the application
RUN bun run build

# Expose port 5173
EXPOSE 5173

# Set the entry point to run the built application
ENTRYPOINT ["bun", "./build"]