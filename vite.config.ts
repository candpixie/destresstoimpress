import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/reddit-api': {
        target: 'https://api.reddit.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/reddit-api/, '')
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
