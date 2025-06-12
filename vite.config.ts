import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate", // Automatically update the service worker
      injectRegister: "auto", // Injects the service worker registration script
      workbox: {
        // Define which files to cache. Adjust as needed.
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
        // Ensure that the default index.html is cached for offline fallback
        navigateFallback: "/index.html",
      },
      manifest: {
        name: "MediLog", // Full name of your application
        short_name: "MediLog", // Short name for home screen icon
        description: "A simple app to track medicine and supplement intake",
        theme_color: "#1e90ff", // Theme color for the browser UI (matches sky-600 in your header)
        background_color: "#ffffff", // Background color for the splash screen
        display: "standalone", // Makes the app feel more native (hides browser UI)
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'  
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
        // You can add more properties like screenshots, related_applications, etc.
        // For more details, refer to: https://developer.mozilla.org/en-US/docs/Web/Manifest
      },
      devOptions: {
        enabled: true, // Enable PWA in development for testing
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
