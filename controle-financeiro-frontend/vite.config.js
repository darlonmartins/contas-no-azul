import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
  },
  // ❌ REMOVA ESSA PARTE ABAIXO
  // build: {
  //   rollupOptions: {
      external: [ 'framer-motion','recharts','dayjs','date-fns'],
    //     external: ['lucide-react', 'framer-motion','recharts','dayjs','date-fns'],
  //   },
  // },
});
