import { Eye, EyeOff, Lock, Moon, Sun, User } from 'lucide-react';

import type React from 'react';
import { useState } from 'react';

import { Link, useLocation } from 'react-router';

import { useTheme } from '~/components/theme-provider';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { useAuth } from '~/context/AuthContext';
import { cn } from '~/lib/utils';
import { Label } from '../ui/label';

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [input, setInput] = useState({
    usuario: '',
    contrasena: ''
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  // Función para alternar entre temas claro y oscuro
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSubmitEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null); // Limpiar error anterior

    if (input.usuario && input.contrasena) {
      try {
        // Obtener la ruta desde donde vino el usuario, o usar dashboard por defecto
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        await login(input.usuario, input.contrasena, from);
        // La redirección se maneja en el contexto de autenticación
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Error desconocido al iniciar sesión';
        // Simplificar mensaje genérico si la API no da uno claro
        setErrorMessage(
          message.includes('Failed to fetch')
            ? 'Error de conexión. Inténtalo de nuevo.'
            : message
        );
      }
    } else {
      setErrorMessage('El usuario y la contraseña son obligatorios.');
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput(prev => ({
      ...prev,
      [name]: value
    }));
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
          Bienvenido
        </h1>
        <p className='text-sm text-slate-600 dark:text-slate-400'>
          Inicia sesión para acceder al sistema
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

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label
                htmlFor='usuario'
                className='block text-sm font-semibold text-slate-700 dark:text-slate-300'
              >
                Email
              </Label>
              <div className='relative group'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <User className='h-5 w-5 text-primary/30 group-focus-within:text-primary/70 transition-colors' />
                </div>
                <Input
                  id='usuario'
                  name='usuario'
                  type='email'
                  placeholder='email@ejemplo.com'
                  value={input.usuario}
                  onChange={handleInput}
                  required
                  className='pl-12 h-12 bg-background border-border focus:ring-ring rounded-xl   transition-all'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label
                  htmlFor='contrasena'
                  className='block text-sm font-semibold text-slate-700 dark:text-slate-300'
                >
                  Contraseña
                </Label>
                <Link
                  to='/auth/forgot-password'
                  className='text-xs text-primary font-medium transition-colors'
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className='relative group'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-primary/30 group-focus-within:text-primary/70 transition-colors' />
                </div>
                <Input
                  id='contrasena'
                  name='contrasena'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Ingresa tu contraseña'
                  value={input.contrasena}
                  onChange={handleInput}
                  required
                  className='pl-12 h-12 bg-background border-border focus:ring-ring rounded-xl   transition-all'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors'
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5 text-primary/30 group-focus-within:text-primary/70 transition-colors' />
                  ) : (
                    <Eye className='h-5 w-5 text-primary/30 group-focus-within:text-primary/70 transition-colors' />
                  )}
                </button>
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
                <span>Iniciando sesión...</span>
              </div>
            ) : (
              'Iniciar sesión'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
