/* eslint-disable no-empty-pattern */
import { useEffect, useState } from 'react';

import { Navigate, useSearchParams } from 'react-router';

import { ResetForm } from '~/components/auth/reset-form';
import { ThemeProvider } from '~/components/theme-provider';
import { useAuth } from '~/context/AuthContext';

import type { Route } from './+types/reset-password';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Restablecer Contraseña' },
    { name: 'description', content: 'Enerlova | Restablecer Contraseña' }
  ];
}

const ResetPassword = () => {
  const { isAuthenticated, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Animación de entrada para los elementos de la página
  useEffect(() => {
    setMounted(true);
  }, []);

  if (isAuthenticated && !loading) {
    return <Navigate to='/dashboard' replace />;
  }

  return (
    <ThemeProvider>
      <div className="relative bg-[url('/fondo.jpg')] dark:bg-[url('/fondo-dark.jpg')] bg-cover bg-center flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        {/* Overlay with gradient */}
        <div className='absolute inset-0 bg-background/40 backdrop-blur-sm'></div>

        {/* Company logo for larger screens */}
        <div
          className={`hidden lg:block absolute top-8 left-8 transform transition-all duration-1000 ease-out ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <div className='flex items-center gap-2'>
            <div className='bg-card/90 p-2 rounded-full'>
              <img src='/logo-enerlova.png' alt='Enerlova' className='h-10' />
            </div>
            <span className='text-white text-xl font-bold'>Enerlova</span>
          </div>
        </div>

        {/* Main content */}
        <div className='relative w-full max-w-md mx-auto'>
          <ResetForm token={token || undefined} />

          {/* Footer */}
          <div
            className={`mt-6 text-center text-muted-foreground text-xs transform transition-all duration-1000 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            © {new Date().getFullYear()} Enerlova. Todos los derechos
            reservados.
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ResetPassword;
