import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import type { Plugin } from 'vite';

// Plugin to dynamically load environment-specific CSS
const envCssPlugin = (): Plugin => {
  return {
    name: 'env-css-plugin',
    enforce: 'pre',
    resolveId(id) {
      // Intercept app.css imports and resolve to environment-specific CSS
      if (id.endsWith('/app.css') || id === './app.css') {
        const envMode = process.env.VITE_ENV_MODE || process.env.NODE_ENV || 'production';
        if (envMode === 'development') {
          return id.replace('app.css', 'app.dev.css');
        }
      }
      return null;
    }
  };
};

export default defineConfig({
  plugins: [envCssPlugin(), tailwindcss(), reactRouter(), tsconfigPaths()],
  define: {
    'import.meta.env.VITE_ENV_MODE': JSON.stringify(process.env.VITE_ENV_MODE || process.env.NODE_ENV || 'production')
  }
});
