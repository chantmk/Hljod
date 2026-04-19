import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pkg from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Dev proxy: forward /api and /health to HermesScrypt
      "/api": {
        target: process.env.VITE_API_URL ?? "http://nas.local:8000",
        changeOrigin: true,
      },
      "/health": {
        target: process.env.VITE_API_URL ?? "http://nas.local:8000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
        },
      },
    },
  },
});
