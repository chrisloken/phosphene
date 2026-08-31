import { defineConfig } from "vite";

const pagesBase = process.env.PHOSPHENE_BASE ?? "./";

export default defineConfig({
  base: pagesBase,
  server: {
    host: true,
    port: 43147,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 43147,
    strictPort: true,
  },
});
