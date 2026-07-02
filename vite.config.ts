import { reactRouter } from '@react-router/dev/vite';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';

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

function decoratorPreset(options: Record<string, unknown>) {
  return {
    preset: () => ({
      plugins: [['@babel/plugin-proposal-decorators', options]]
    }),
    rolldown: {
      // Ejecuta esta transformación solo si el archivo contiene un decorador.
      filter: {
        code: '@'
      }
    }
  };
}

export default defineConfig({
  plugins: [
    babel({ presets: [decoratorPreset({ version: 'legacy' })] }),
    envCssPlugin(),
    tailwindcss(),
    reactRouter()
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app')
    }
  }
});
