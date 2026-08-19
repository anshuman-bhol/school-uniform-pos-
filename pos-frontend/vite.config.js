import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        name: "School Uniform POS",
        short_name: "POS",

        description: "School Uniform POS System",

        theme_color: "#000000",
        background_color: "#000000",

        display: "standalone",

        start_url: "/",

        icons: [
          {
            src: "./public/header.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "./public/loginlogo.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});