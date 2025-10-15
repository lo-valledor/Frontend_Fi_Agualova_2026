import { Eye, EyeOff, Lock, Moon, Sun, User } from 'lucide-react';

import type React from 'react';
import { useEffect, useState } from 'react';

import { Link, useLocation } from 'react-router';

import { useTheme } from '~/components/theme-provider';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { useAuth } from '~/context/AuthContext';
import { cn } from '~/lib/utils';

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
          Iniciar Sesión
        </h1>
        <p className='text-center text-muted-foreground mt-2 text-sm'>
          Ingrese sus credenciales para acceder al sistema
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

          <div className='space-y-4'>
            <div className='space-y-2'>
              <label
                htmlFor='usuario'
                className='block text-sm font-medium text-foreground'
              >
                Usuario
              </label>
              <div className='relative group'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <User className='h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200' />
                </div>
                <Input
                  id='usuario'
                  name='usuario'
                  type='text'
                  placeholder='Nombre de Usuario'
                  value={input.usuario}
                  onChange={handleInput}
                  required
                  className='pl-10 bg-muted/50 border-border focus:border-primary focus:ring-primary rounded-xl transition-all duration-200 focus:shadow-md'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <label
                  htmlFor='contrasena'
                  className='block text-sm font-medium text-foreground'
                >
                  Contraseña
                </label>
                <Link
                  to='/auth/forgot-password'
                  className='text-xs text-primary hover:text-primary/80 transition-colors duration-200'
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className='relative group'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200' />
                </div>
                <Input
                  id='contrasena'
                  name='contrasena'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='********'
                  value={input.contrasena}
                  onChange={handleInput}
                  required
                  className='pl-10 pr-10 bg-muted/50 border-border focus:border-primary focus:ring-primary rounded-xl transition-all duration-200 focus:shadow-md'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors'
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>
            </div>
          </div>

          <Button
            type='submit'
            disabled={loading}
            className='w-full py-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300'
          >
            <span className='font-medium'>
              {loading ? (
                <div className='flex items-center justify-center'>
                  <svg
                    className='animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground'
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
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar sesión'
              )}
            </span>
          </Button>
        </form>
      </div>
    </div>
  );
}
