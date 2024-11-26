FROM oven/bun:latest AS builder

WORKDIR /app

COPY . .

RUN bun i
RUN bun run build
 
FROM oven/bun:latest

COPY --from=builder /app/build .

EXPOSE 4173

USER bun

CMD ["bun", "run", "preview"]