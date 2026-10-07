import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
    port: 5173,
    proxy: {
      "/auth": { target: "http://backend:3333", changeOrigin: true },
      "/usuarios": { target: "http://backend:3333", changeOrigin: true },
      "/cadastros": { target: "http://backend:3333", changeOrigin: true },
      "/agenda": { target: "http://backend:3333", changeOrigin: true },
      "/clientes": { target: "http://backend:3333", changeOrigin: true },
      "/financeiro": { target: "http://backend:3333", changeOrigin: true },
      "/api": { target: "http://backend:3333", changeOrigin: true },
    },
  },
});
