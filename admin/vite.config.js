import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Serverda admin panel https://.../admin manzilida ochiladi,
  // kompyuterda esa odatdagidek localhost:5174 da
  base: command === 'build' ? '/admin/' : '/',
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
}));
