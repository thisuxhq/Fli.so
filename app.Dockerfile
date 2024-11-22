# app.Dockerfile
FROM oven/bun:1 as builder

WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install

COPY . .
RUN bun run build

FROM oven/bun:1-slim as runner
WORKDIR /app

COPY --from=builder /app/build build/
COPY --from=builder /app/package.json ./
RUN bun install --production

EXPOSE 3000
CMD ["bun", "build/index.js"]
