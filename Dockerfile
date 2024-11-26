FROM oven/bun:latest AS builder

WORKDIR /app

COPY . .

RUN bun i
RUN bun run build
 
FROM oven/bun:latest

COPY --from=builder /app/build .

ENV PORT 3000
EXPOSE 3000

USER bun

CMD ["bun", "run", "preview"]