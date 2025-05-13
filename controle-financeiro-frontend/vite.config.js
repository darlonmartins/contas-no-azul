import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // ✅ Cria o alias @ para facilitar os imports
    },
  },
  server: {
    port: 5173, // ✅ Porta fixa para ambiente local
  },
  build: {
    rollupOptions: {
      external: [
        'lucide-react',       // ✅ Evita erro de resolução no build
        'framer-motion',
        'recharts',
        'dayjs',
        'date-fns'
      ],
    },
  },
});
