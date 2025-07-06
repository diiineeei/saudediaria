import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true  // para testar service worker em dev mode
      },
      manifest: {
        name: "Saúde Diária",
        short_name: "Saúde",
        start_url: "/",
        display: "standalone",
        background_color: "#202124",
        theme_color: "#1a73e8",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  base: "/saudediaria/",
});
