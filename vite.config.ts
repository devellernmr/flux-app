import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Increase the warning limit to 1000kb (default is 500kb)
    chunkSizeWarningLimit: 1000, 
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separate node_modules into a 'vendor' chunk
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          
          // OR: More granular splitting (Recommended if vendor is still too big)
          /*
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            if (id.includes('lucide-react') || id.includes('radix-ui')) {
              return 'ui-vendor';
            }
            // Put the rest in a general vendor chunk
            return 'vendor'; 
          }
          */
        },
      },
    },
  },
});
