import { ArrowLeft, Mail, Moon, Send, Sun } from 'lucide-react';

import type React from 'react';
import { useEffect, useState } from 'react';

import { Link } from 'react-router';

import { useTheme } from '~/components/theme-provider';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
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
  const [mounted, setMounted] = useState(false);

  // Animación de entrada
  useEffect(() => {
    setMounted(true);
  }, []);

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
        'relative overflow-hidden rounded-xl transition-all duration-500 ease-in-out',
        'bg-card/90 backdrop-blur-sm',
        'shadow-xl border border-border',
        'transform opacity-0 translate-y-4',
        mounted && 'opacity-100 translate-y-0',
        className
      )}
      {...props}
    >
      {/* Decorative elements */}
      <div className='absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full opacity-20 blur-2xl animate-pulse'></div>
      <div
        className='absolute -bottom-24 -left-24 w-48 h-48 bg-accent/20 rounded-full opacity-20 blur-2xl animate-pulse'
        style={{ animationDuration: '8s' }}
      ></div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className='absolute top-4 right-4 p-2 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200'
        aria-label='Toggle theme'
      >
        {theme === 'light' ? (
          <Moon className='h-4 w-4' />
        ) : (
          <Sun className='h-4 w-4' />
        )}
      </button>

      {/* Logo and header */}
      <div className='pt-8 pb-4 px-8'>
        <h1 className='text-2xl font-bold text-center text-primary'>
          Recuperar Contraseña
        </h1>
        <p className='text-center text-muted-foreground mt-2 text-sm'>
          Ingrese su correo electrónico para recibir instrucciones de
          recuperación
        </p>
      </div>

      {/* Form */}
      <div className='p-8 pt-2'>
        <form onSubmit={handleSubmitEvent} className='space-y-6'>
          {errorMessage && (
            <div className='p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fadeIn'>
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className='p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-border text-emerald-600 dark:text-emerald-400 text-sm animate-fadeIn'>
              {successMessage}
            </div>
          )}

          <div className='space-y-4'>
            <div className='space-y-2'>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-foreground'
              >
                Correo Electrónico
              </label>
              <div className='relative group'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Mail className='h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200' />
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
                  className='pl-10 bg-muted/50 border-border focus:border-primary focus:ring-primary rounded-xl transition-all duration-200 focus:shadow-md'
                />
              </div>
            </div>
          </div>

          <Button
            type='submit'
            disabled={loading}
            className='w-full py-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300'
          >
            <span className='font-medium flex items-center justify-center gap-2'>
              {loading ? (
                <>
                  <svg
                    className='animate-spin h-5 w-5 text-primary-foreground'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className='h-5 w-5' />
                  Enviar enlace de recuperación
                </>
              )}
            </span>
          </Button>

          <div className='text-center'>
            <Link
              to='/auth/login'
              className='inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors duration-200'
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
