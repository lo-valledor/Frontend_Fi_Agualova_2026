import { ArrowLeft, Mail, Moon, Send, Sun } from 'lucide-react';

import type React from 'react';
import { useState } from 'react';

import { Link } from 'react-router';
import { toast } from 'sonner';

import { authService } from '~/services/authService';

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
  const [loading, setLoading] = useState(false);
  const { theme, setTheme } = useTheme();

  // Función para alternar entre temas claro y oscuro
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSubmitEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      toast.error('El correo electrónico es obligatorio.');
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Por favor ingrese un correo electrónico válido.');
      return;
    }

    setLoading(true);

    try {
      const message = await authService.forgotPassword(email);

      toast.success(message, {
        duration: 6000
      });

      setEmail('');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al solicitar la recuperación de contraseña';

      toast.error(
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
      <div className='pt-10 pb-6 px-8 text-center border-b border-slate-200/50 dark:border-slate-700/50'>
        <h1 className='text-3xl font-bold text-slate-900 dark:text-white mb-2'>
          Recuperar Contraseña
        </h1>
        <p className='text-sm text-slate-600 dark:text-slate-400'>
          Ingrese su correo electrónico para recibir instrucciones de
          recuperación
        </p>
      </div>

      {/* Form */}
      <div className='p-8'>
        <form onSubmit={handleSubmitEvent} className='space-y-5'>
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
                  <Mail className='h-5 w-5 text-primary transition-colors' />
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
            variant='default'
            disabled={loading}
            className='w-full h-12 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6'
          >
            {loading ? (
              <div className='flex items-center justify-center gap-2'>
                <svg
                  className='animate-spin h-5 w-5'
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
              className='inline-flex items-center gap-2 text-sm transition-colors duration-200 text-primary'
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
