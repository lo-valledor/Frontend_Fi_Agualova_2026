import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import type { Plugin } from 'vite';
import path from 'path';

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

export default defineConfig({
  plugins: [envCssPlugin(), tailwindcss(), reactRouter(), tsconfigPaths()]
});
