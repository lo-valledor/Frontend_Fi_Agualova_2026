/* eslint-disable no-empty-pattern */
import { useEffect, useState } from 'react';

import { Navigate } from 'react-router';

import { ForgotForm } from '~/components/auth/forgot-form';
import { ThemeProvider } from '~/components/theme-provider';
import { useAuth } from '~/context/AuthContext';

import type { Route } from './+types/forgot-password';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Recuperar Contraseña' },
    { name: 'description', content: 'Enerlova | Recuperar Contraseña' }
  ];
}

const ForgotPassword = () => {
  const { isAuthenticated, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

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

        {/* Animated energy particles */}
        <div className='absolute inset-0 overflow-hidden'>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className='absolute w-2 h-2 rounded-full bg-primary/70 animate-floatingParticle'
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${5 + Math.random() * 10}s`,
                animationDelay: `${Math.random() * 5}s`
              }}
            ></div>
          ))}
        </div>

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
          <ForgotForm />

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

export default ForgotPassword;
