import { AlertCircleIcon, ArrowLeft, CheckCircle2, Loader2, Mail, Moon, Send, Sun } from 'lucide-react';

import type React from 'react';
import { useState } from 'react';

import { Link } from 'react-router';
import { toast } from 'sonner';

import { authService } from '~/services/authService';

import { useTheme } from '~/components/theme-provider';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { cn } from '~/lib/utils';
import { authService } from '~/services/authService';

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
      // Llamar al servicio de API para solicitar recuperación de contraseña
      await authService.forgotPassword(email);

      setEmail('');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al solicitar la recuperación de contraseña';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={cn('relative w-full max-w-md', className)} {...props}>
      {/* Theme toggle */}
      <Button
        onClick={toggleTheme}
        variant='ghost'
        size='icon'
        className='absolute top-4 right-4 z-10'
        aria-label='Toggle theme'
      >
        {theme === 'light' ? (
          <Moon className='h-4 w-4' />
        ) : (
          <Sun className='h-4 w-4' />
        )}
      </Button>

      <CardHeader className='text-center space-y-2'>
        <CardTitle className='text-2xl'>Recuperar Contraseña</CardTitle>
        <CardDescription>
          Ingrese su correo electrónico para recibir instrucciones de
          recuperación
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmitEvent} className='space-y-4'>
          {errorMessage && (
            <Alert variant='destructive'>
              <AlertCircleIcon className='h-4 w-4' />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className='border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400'>
              <CheckCircle2 className='h-4 w-4' />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-2'>
            <Label htmlFor='email'>Correo Electrónico</Label>
            <div className='relative'>
              <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='correo@ejemplo.com'
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
                className='pl-10'
              />
            </div>
          </div>

          <Button type='submit' disabled={loading} className='w-full'>
            {loading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Enviando...
              </>
            ) : (
              <>
                <Send className='mr-2 h-4 w-4' />
                Enviar enlace de recuperación
              </>
            )}
          </Button>

          <div className='text-center'>
            <Link
              to='/auth/login'
              className='inline-flex items-center gap-2 text-sm text-primary hover:underline'
            >
              <ArrowLeft className='h-4 w-4' />
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
