import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // 🔧 necessário para configurar o alias

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // ✅ cria o alias @ para a pasta src
    },
  },
  server: {
    port: 5173, // ✅ mantém a porta fixa do frontend
  },
});
