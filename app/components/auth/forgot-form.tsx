import { ArrowLeft, Loader2, Mail, Moon, Send, Sun } from 'lucide-react';

import type React from 'react';
import { useState } from 'react';

import { Link } from 'react-router';

import { useTheme } from '~/components/theme-provider';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { cn } from '~/lib/utils';

export function ForgotForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { theme, setTheme } = useTheme();

  // Función para alternar entre temas claro y oscuro
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSubmitEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email) {
      setErrorMessage('El correo electrónico es obligatorio.');
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Por favor ingrese un correo electrónico válido.');
      return;
    }

    setLoading(true);

    try {
      // TODO: Implementar llamada a la API para solicitar recuperación de contraseña
      // await authService.forgotPassword(email);

      // Simulación temporal
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccessMessage(
        'Se ha enviado un enlace de recuperación a su correo electrónico. Por favor revise su bandeja de entrada.'
      );
      setEmail('');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al solicitar la recuperación de contraseña';
      setErrorMessage(
        message.includes('Failed to fetch')
          ? 'Error de conexión. Inténtalo de nuevo.'
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl transition-all duration-500',
        'bg-background backdrop-blur-xl',
        'shadow-2xl border border-border',
        className
      )}
      {...props}
    >
      {/* Theme toggle */}
      <Button
        onClick={toggleTheme}
        variant='ghost'
        className='absolute top-5 right-5 z-20 p-2.5 rounded-xl bg-background transition-all duration-200'
        aria-label='Toggle theme'
      >
        {theme === 'light' ? (
          <Moon className='h-4 w-4' />
        ) : (
          <Sun className='h-4 w-4' />
        )}
      </Button>

      {/* Header */}
      <div className='pt-10 pb-6 px-8 text-center border-b border-border'>
        <h1 className='text-3xl font-bold'>
          Recuperar Contraseña
        </h1>
        <p className='text-sm text-muted-foreground mt-2'>
          Ingrese su correo electrónico para recibir instrucciones de
          recuperación
        </p>
      </div>

      {/* Form */}
      <div className='p-8'>
        <form onSubmit={handleSubmitEvent} className='space-y-5'>
          {errorMessage && (
            <div className='p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm flex items-start gap-2'>
              <svg
                className='h-5 w-5 mt-0.5 flex-shrink-0'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className='p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-sm flex items-start gap-2'>
              <svg
                className='h-5 w-5 mt-0.5 flex-shrink-0'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label
                htmlFor='email'
                className='block text-sm font-semibold text-slate-700 dark:text-slate-300'
              >
                Correo Electrónico
              </Label>
              <div className='relative group'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <Mail className='h-5 w-5  group-focus-within:text-ring transition-colors' />
                </div>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  placeholder='correo@ejemplo.com'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className='pl-12 h-12 bg-background border-border focus:ring-ring rounded-xl transition-all'
                />
              </div>
            </div>
          </div>

          <Button
            type='submit'
            variant="default"
            disabled={loading}
            className='w-full h-12 rounded-xl font-semibold shadow-lg  transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6'
          >
            {loading ? (
              <div className='flex items-center justify-center gap-2'>
                <Loader2 className='h-5 w-5 animate-spin' />
                <span>Enviando...</span>
              </div>
            ) : (
              <div className='flex items-center justify-center gap-2'>
                <Send className='h-5 w-5' />
                <span>Enviar enlace de recuperación</span>
              </div>
            )}
          </Button>

          <div className='text-center mt-4'>
            <Link
              to='/auth/login'
              className='inline-flex items-center gap-2 text-sm text-primary hover:underline transition-colors duration-200'
            >
              <ArrowLeft className='h-4 w-4' />
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
