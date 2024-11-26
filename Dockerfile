FROM oven/bun:latest

WORKDIR /app
COPY package.json package.json
RUN bun install

COPY . .
RUN bun run build

EXPOSE 3000
CMD ["bun", "--bun", "build/index.js"]