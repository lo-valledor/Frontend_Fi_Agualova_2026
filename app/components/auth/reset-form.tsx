import { ArrowLeft, Eye, EyeOff, Lock, Moon, Send, Sun } from 'lucide-react';

import type React from 'react';
import { useState } from 'react';

import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';

import { authService } from '~/services/authService';
import { isPasswordSecure, passwordsMatch } from '~/utils/password-validation';

import { PasswordStrengthIndicator } from '~/components/ui/password-strength-indicator';
import { useTheme } from '~/components/theme-provider';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { cn } from '~/lib/utils';

interface ResetFormProps extends React.ComponentPropsWithoutRef<'div'> {
  token?: string;
}

export function ResetForm({ className, token, ...props }: ResetFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Función para alternar entre temas claro y oscuro
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSubmitEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Ambos campos son obligatorios.');
      return;
    }

    // Validar que la contraseña sea segura
    const passwordCheck = isPasswordSecure(password);
    if (!passwordCheck.isSecure) {
      toast.error(
        passwordCheck.reason ||
          'La contraseña no cumple con los requisitos de seguridad'
      );
      return;
    }

    // Validar que las contraseñas coincidan
    if (!passwordsMatch(password, confirmPassword)) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }

    if (!token) {
      toast.error('Token de recuperación inválido o expirado.');
      return;
    }

    setLoading(true);

    try {
      const message = await authService.resetPassword(token, password);

      toast.success(message, {
        duration: 6000
      });

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al restablecer la contraseña';

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
          Restablecer Contraseña
        </h1>
        <p className='text-sm text-slate-600 dark:text-slate-400'>
          Ingrese su nueva contraseña segura para restablecer el acceso
        </p>
      </div>

      {/* Form */}
      <div className='p-8'>
        <form onSubmit={handleSubmitEvent} className='space-y-5'>
          <div className='space-y-4'>
            {/* Nueva Contraseña */}
            <div className='space-y-2'>
              <Label
                htmlFor='password'
                className='block text-sm font-semibold text-slate-700 dark:text-slate-300'
              >
                Nueva Contraseña
              </Label>
              <div className='relative group'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors' />
                </div>
                <Input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Ingresa una contraseña segura'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className='pl-12 pr-12 h-12 bg-background border-border focus:ring-ring rounded-xl transition-all'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors'
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>

              {/* Indicador de fortaleza de contraseña */}
              {password && (
                <PasswordStrengthIndicator
                  password={password}
                  showRules={true}
                  showWarnings={true}
                />
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div className='space-y-2'>
              <Label
                htmlFor='confirmPassword'
                className='block text-sm font-semibold text-slate-700 dark:text-slate-300'
              >
                Confirmar Contraseña
              </Label>
              <div className='relative group'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors' />
                </div>
                <Input
                  id='confirmPassword'
                  name='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder='Confirma tu contraseña'
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className='pl-12 pr-12 h-12 bg-background border-border focus:ring-ring rounded-xl transition-all'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors'
                >
                  {showConfirmPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>

              {/* Indicador de coincidencia */}
              {confirmPassword && password && (
                <div className='flex items-center gap-2 text-sm'>
                  {passwordsMatch(password, confirmPassword) ? (
                    <>
                      <div className='h-2 w-2 rounded-full bg-green-500'></div>
                      <span className='text-green-600 dark:text-green-400'>
                        Las contraseñas coinciden
                      </span>
                    </>
                  ) : (
                    <>
                      <div className='h-2 w-2 rounded-full bg-red-500'></div>
                      <span className='text-red-600 dark:text-red-400'>
                        Las contraseñas no coinciden
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <Button
            type='submit'
            disabled={loading}
            className='w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6'
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
                <span>Restableciendo...</span>
              </div>
            ) : (
              <div className='flex items-center justify-center gap-2'>
                <Send className='h-5 w-5' />
                <span>Restablecer contraseña</span>
              </div>
            )}
          </Button>

          <div className='text-center mt-4'>
            <Link
              to='/auth/login'
              className='inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200'
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
