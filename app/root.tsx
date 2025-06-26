import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import type { Route } from './+types/root';
import './app.css';
import { ThemeProvider } from './components/theme-provider';
import { BreadcrumbProvider } from './context/BreadcrumbContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <BreadcrumbProvider>
            <AuthProvider>{children}</AuthProvider>
          </BreadcrumbProvider>
        </ThemeProvider>
        <Toaster richColors position="top-right" closeButton />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  // Log detallado del error para debugging
  /* console.error('=== ERROR BOUNDARY ACTIVADO ===');
  console.error('Error completo:', error);
  console.error('Navegador:', navigator.userAgent);
  console.error('URL:', window.location.href);
  console.error(
    'LocalStorage token:',
    localStorage.getItem('token') ? 'EXISTE' : 'NO EXISTE',
  ); */

  let message = '¡Ups!';
  let details = 'Ha ocurrido un error inesperado.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'La página solicitada no pudo ser encontrada.'
        : error.statusText || details;
  } else if (error && error instanceof Error) {
    details = error.message;
    stack = error.stack;

    // Log específico para errores de JavaScript
    /* console.error('Mensaje del error:', error.message);
    console.error('Stack trace:', error.stack); */
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-red-600 mb-4">{message}</h1>
        <p className="text-lg mb-4">{details}</p>

        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
          <h2 className="font-semibold mb-2">Información de depuración:</h2>
          <ul className="text-sm space-y-1">
            <li>
              <strong>Navegador:</strong> {navigator.userAgent}
            </li>
            <li>
              <strong>URL:</strong> {window.location.href}
            </li>
            <li>
              <strong>Token en localStorage:</strong>{' '}
              {localStorage.getItem('token') ? 'SÍ' : 'NO'}
            </li>
          </ul>
        </div>

        {stack && (
          <details className="mb-4">
            <summary className="cursor-pointer font-semibold">
              Ver stack trace completo
            </summary>
            <pre className="w-full p-4 overflow-x-auto bg-gray-100 dark:bg-gray-800 rounded mt-2 text-xs">
              <code>{stack}</code>
            </pre>
          </details>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Recargar página
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/auth/login';
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Limpiar sesión y volver al login
          </button>
        </div>
      </div>
    </main>
  );
}
