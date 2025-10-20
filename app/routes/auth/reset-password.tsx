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
      <div className='relative flex min-h-svh w-full overflow-hidden'>
        {/* Left Panel - Company Information */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative bg-[url('/fondo-dark.jpg')] bg-cover bg-center">
          {/* Overlay with gradient */}
          <div className='absolute inset-0'></div>

          {/* Content */}
          <div
            className={`relative z-10 flex flex-col justify-between p-12 transform transition-all duration-1000 ease-out ${
              mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            {/* Logo and Company Name */}
            <div className='flex items-center gap-3'>
              <div className='bg-white/10 backdrop-blur-sm p-3 rounded-2xl'>
                <img
                  src='/logo-enerlova.png'
                  alt='Enerlova'
                  className='h-12 w-12'
                />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-white shadow-lg'>
                  Enerlova
                </h1>
              </div>
            </div>

            {/* Footer */}
            <div className='text-sm text-white/70'>
              © {new Date().getFullYear()} Enerlova. Todos los derechos
              reservados.
            </div>
          </div>
        </div>

        {/* Right Panel - Reset Form */}
        <div className='flex-1 flex items-center justify-center p-6 md:p-10 bg-background'>
          {/* Mobile Logo */}
          <div
            className={`lg:hidden absolute top-6 left-6 transform transition-all duration-1000 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <div className='flex items-center gap-2'>
              <div className='bg-card p-2 rounded-full shadow-lg'>
                <img src='/logo-enerlova.png' alt='Enerlova' className='h-8' />
              </div>
              <div>
                <span className='text-foreground text-lg font-bold'>
                  Enerlova
                </span>
                <p className='text-xs text-muted-foreground'>Enerlova</p>
              </div>
            </div>
          </div>

          {/* Form Container */}
          <div
            className={`w-full max-w-md mx-auto transform transition-all duration-1000 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <ResetForm token={token || undefined} />

            {/* Mobile Footer */}
            <div className='lg:hidden mt-6 text-center text-muted-foreground text-xs'>
              © {new Date().getFullYear()} Enerlova. Todos los derechos
              reservados.
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ResetPassword;
