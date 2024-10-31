FROM oven/bun

ARG VERSION
ENV APP_VERSION=$VERSION

WORKDIR /app
COPY package.json package.json
RUN bun install

COPY . .
RUN bun run build

EXPOSE 3000
ENTRYPOINT ["bun", "./build/index.js"]
