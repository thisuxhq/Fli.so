import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import path from "path";

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      "@assets": path.resolve("./src/assets"),
    },
  },
  server: {
    cors: {
      origin: true,
      credentials: true,
    },
  },
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
  },
});
