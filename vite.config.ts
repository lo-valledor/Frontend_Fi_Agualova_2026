import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import type { Plugin } from 'vite';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

// Plugin para cargar el CSS correcto según el entorno
function envCssPlugin(): Plugin {
  return {
    name: 'env-css-plugin',
    enforce: 'pre',
    resolveId(source, importer) {
      // Interceptar la importación de app.css
      if (source === './app.css' && importer?.includes('app/root.tsx')) {
        const envMode = process.env.VITE_ENV_MODE || 'production';

        // Si es development, redirigir a app.dev.css
        if (envMode === 'development') {
          // Resolver la ruta absoluta
          const dir = path.dirname(importer);
          return path.resolve(dir, 'app.dev.css');
        }
      }
      return null;
    }
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [
    envCssPlugin(),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),

    // Bundle analyzer - solo en build
    mode === 'analyze' &&
      visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true
      }),

    // Compresión gzip y brotli para producción
    mode === 'production' &&
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz'
      }),
    mode === 'production' &&
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br'
      })
  ].filter(Boolean),

  // Optimizaciones de build
  build: {
    // Aumentar el límite de advertencia de chunk size
    chunkSizeWarningLimit: 1000,

    // Optimización de rollup
    rollupOptions: {
      output: {
        // Separar vendor chunks - función para evitar conflictos con SSR
        manualChunks: id => {
          // Solo aplicar code splitting en el cliente, no en SSR
          if (id.includes('node_modules')) {
            // React core
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router')
            ) {
              return 'react-vendor';
            }

            // UI libraries
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }

            // Form libraries
            if (
              id.includes('react-hook-form') ||
              id.includes('zod') ||
              id.includes('@hookform/resolvers')
            ) {
              return 'form-vendor';
            }

            // Table library
            if (id.includes('@tanstack/react-table')) {
              return 'table-vendor';
            }

            // Chart library
            if (id.includes('recharts')) {
              return 'chart-vendor';
            }

            // Icons
            if (
              id.includes('lucide-react') ||
              id.includes('@tabler/icons-react')
            ) {
              return 'icons-vendor';
            }

            // Utilities
            if (
              id.includes('axios') ||
              id.includes('date-fns') ||
              id.includes('clsx') ||
              id.includes('tailwind-merge')
            ) {
              return 'utils-vendor';
            }
          }
        }
      }
    },

    // Source maps solo en desarrollo
    sourcemap: mode !== 'production',

    // Minificación
    minify: 'esbuild',

    // Target para navegadores modernos
    target: 'esnext'
  },

  // Optimizaciones de servidor de desarrollo
  server: {
    // Pre-bundling optimizado
    warmup: {
      clientFiles: ['./app/root.tsx', './app/routes/**/*.tsx']
    },
    // Proxy para evitar problemas de CORS y SSL en desarrollo
    proxy: {
      '/api': {
        target: 'http://enerlovauat.mmlovalledor.cl',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api/, '/Enerlova')
      }
    }
  },

  // Optimizaciones de dependencias
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'react-hook-form',
      'zod'
    ]
  }
}));
