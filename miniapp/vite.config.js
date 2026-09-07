import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // ngrok domenidan kirishga ruxsat
    allowedHosts: true,
    // /api so'rovlari backendga uzatiladi -> ngrok uchun bitta tunnel yetarli
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
