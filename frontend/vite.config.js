import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rolldownOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react-router')) return 'react';
          if (id.includes('react-dom') || id.includes('/react/')) return 'react';
          if (id.includes('framer-motion')) return 'motion';
          if (id.includes('recharts') || id.includes('victory-vendor') || id.includes('d3-')) return 'charts';
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) return 'forms';
          return 'vendor';
        },
      },
    },
  },
});
