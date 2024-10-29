import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true
  }
});
