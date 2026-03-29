import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// Change '/breathing-app/' to match your GitHub Pages subfolder
export default defineConfig({
  base: '/breathing-app/',
  preview: {
    allowedHosts: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
      manifest: {
        name: '4-7-8 Breathing',
        short_name: 'Breathe',
        description: 'Guided 4-7-8 breathing exercises for calm and focus',
        theme_color: '#04080f',
        background_color: '#04080f',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/breathing-app/',
        scope: '/breathing-app/',
        icons: [
          {
            src: '/breathing-app/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/breathing-app/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/breathing-app/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
});
