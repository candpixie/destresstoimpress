import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (req.url?.startsWith('/api/emotibit')) {
              let body = '';
              req.on('data', chunk => {
                body += chunk.toString();
              });
              
              req.on('end', async () => {
                try {
                  // Handle EmotiBit API requests using dynamic import
                  const { default: emotiBitService } = await import('./src/api/emotibit.ts');
                  
                  const requestData = body ? JSON.parse(body) : {};
                  const useEmotiBit = requestData.useEmotiBit || false;
                  
                  const reading = await emotiBitService.getReading(useEmotiBit);
                  
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(reading));
                } catch (error) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Failed to get biometric data' }));
                }
              });
              
              // Prevent the proxy from forwarding the request
              proxyReq.destroy();
            }
          });
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
