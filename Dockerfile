FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lockb ./

# Install dependencies first for better caching
RUN bun install

COPY . .

# Configure Vite to listen on all interfaces
ENV HOST=0.0.0.0

EXPOSE 5173

# Use development mode
CMD ["bun", "run", "dev", "--host"]