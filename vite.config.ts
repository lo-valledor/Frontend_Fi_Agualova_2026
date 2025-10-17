import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    host: true, // Necesario para Docker
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Necesario para hot reload en Docker
    },
  },
  define: {
    // Hacer que las variables de entorno estén disponibles en el cliente
    'import.meta.env.VITE_APP_ENV': JSON.stringify(
      process.env.VITE_APP_ENV || process.env.NODE_ENV || 'production'
    )
  }
});
