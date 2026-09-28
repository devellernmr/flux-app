import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1',
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Mantém o helper de preload do Vite dentro do `vendor` (carregado na
          // primeira dobra). Sem isso o Rollup pode agrupá-lo em um chunk pesado
          // de rota lazy (ex.: pdf-vendor) e forçar o download dele no boot.
          if (id.includes('vite/preload-helper')) {
            return 'vendor';
          }
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'motion-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'lucide-vendor';
            }
            if (id.includes('recharts') || id.includes('d3')) {
              return 'charts-vendor';
            }
            // Bibliotecas usadas apenas por rotas lazy (exportação de PDF, export/CSV,
            // confete e formatação de datas). Isoladas em chunks próprios para NÃO
            // entrarem no `modulepreload` da primeira dobra.
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'pdf-vendor';
            }
            if (id.includes('canvas-confetti')) {
              return 'effects-vendor';
            }
            if (id.includes('date-fns')) {
              return 'date-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});
