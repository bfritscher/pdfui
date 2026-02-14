import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  server: {
    proxy: {
      "/session": "http://localhost:3000",
      "/reset": "http://localhost:3000",
      "/upload": "http://localhost:3000",
      "/export": "http://localhost:3000",
      "/zip": "http://localhost:3000",
      "/mafp": "http://localhost:3000",
      "/uploads": "http://localhost:3000",
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
