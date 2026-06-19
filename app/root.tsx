import { Toaster } from 'sonner';

import React, { useEffect } from 'react';

import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useNavigation
} from 'react-router';

import './app.css';
const isUAT =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'agualova.mmlovalledor.cl';
if (isUAT) {
  import('./app.uat.css');
}

import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './context/AuthContext';
import { BreadcrumbProvider } from './context/BreadcrumbContext';
import { LoadingBarProvider, useLoadingBar } from './context/LoadingBarContext';
import { initPerformanceMonitoring } from './utils/performance-monitor';

export const links = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous'
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap'
  }
];

export function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const isDev =
    import.meta.env.VITE_APP_ENV === 'development' || import.meta.env.DEV;

  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        {!isDev && (
          <meta
            http-equiv='Content-Security-Policy'
            content='upgrade-insecure-requests'
          ></meta>
        )}
        <Meta />
        <Links />
      </head>
      <body className={isDev ? 'dev-environment' : ''}>
        <LoadingBarProvider>
          <AppLayout>{children}</AppLayout>
        </LoadingBarProvider>
      </body>
    </html>
  );
}

function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const navigation = useNavigation();
  const loadingBar = useLoadingBar();

  useEffect(() => {
    if (!loadingBar?.current) {
      return;
    }
    if (navigation.state === 'loading' || navigation.state === 'submitting') {
      loadingBar.current.continuousStart();
    } else {
      loadingBar.current.complete();
    }
  }, [navigation.state, loadingBar]);

  return (
    <>
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        <BreadcrumbProvider>
          <AuthProvider>{children}</AuthProvider>
        </BreadcrumbProvider>
      </ThemeProvider>
      <Toaster richColors position='top-right' closeButton />
      <ScrollRestoration />
      <Scripts />
    </>
  );
}

export default function App() {
  // Inicializar monitoreo de performance
  useEffect(() => {
    initPerformanceMonitoring();
  }, []);

  return <Outlet />;
}

export function ErrorBoundary({ error }: Readonly<{ error: unknown }>) {
  let message = '¡Ups!';
  let details = 'Ha ocurrido un error inesperado.';
  let stack: string | undefined;
  const isBrowser = typeof window !== 'undefined';
  const userAgent = isBrowser ? navigator.userAgent : 'No disponible en SSR';
  const currentUrl = isBrowser
    ? globalThis.location.href
    : 'No disponible en SSR';
  const hasToken = isBrowser ? localStorage.getItem('token') : null;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'La página solicitada no pudo ser encontrada.'
        : error.statusText || details;
  } else if (error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className='pt-16 p-4 container mx-auto'>
      <div className='max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold text-red-600 mb-4'>{message}</h1>
        <p className='text-lg mb-4'>{details}</p>

        <div className='bg-card p-4 rounded-xl mb-4'>
          <h2 className='font-semibold mb-2'>Información de depuración:</h2>
          <ul className='text-sm space-y-1'>
            <li>
              <strong>Navegador:</strong> {userAgent}
            </li>
            <li>
              <strong>URL:</strong> {currentUrl}
            </li>
            <li>
              <strong>Token en localStorage:</strong> {hasToken ? 'SÍ' : 'NO'}
            </li>
          </ul>
        </div>

        {stack && (
          <details className='mb-4'>
            <summary className='cursor-pointer font-semibold'>
              Ver stack trace completo
            </summary>
            <pre className='w-full p-4 overflow-x-auto bg-card rounded mt-2 text-xs'>
              <code>{stack}</code>
            </pre>
          </details>
        )}

        <div className='flex gap-4'>
          <button
            onClick={() => {
              if (isBrowser) {
                globalThis.location.reload();
              }
            }}
            className='px-4 py-2 bg-blue-600 rounded hover:bg-blue-700'
          >
            Recargar página
          </button>
          <button
            onClick={() => {
              if (isBrowser) {
                localStorage.clear();
                globalThis.location.href = '/auth/login';
              }
            }}
            className='px-4 py-2 bg-red-600 rounded hover:bg-red-700'
          >
            Limpiar sesión y volver al login
          </button>
        </div>
      </div>
    </main>
  );
}
