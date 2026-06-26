import {
  AlertCircleIcon,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Moon,
  Sun
} from 'lucide-react';

import type React from 'react';
import { useState } from 'react';

import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
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
import { PasswordStrengthIndicator } from '~/components/ui/password-strength-indicator';
import { cn } from '~/lib/utils';
import { authService } from '~/services/authService';
import { isPasswordSecure, passwordsMatch } from '~/utils/password-validation';

interface ResetFormProps extends React.ComponentPropsWithoutRef<'div'> {
  email?: string;
  token?: string;
}

export function ResetForm({
  className,
  email,
  token,
  ...props
}: ResetFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Función para alternar entre temas claro y oscuro
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSubmitEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    // Validar campos vacíos
    if (!password || !confirmPassword) {
      setErrorMessage('Ambos campos son obligatorios.');
      return;
    }

    // Validar seguridad de la contraseña usando utilidades
    const securityCheck = isPasswordSecure(password);
    if (!securityCheck.isSecure) {
      setErrorMessage(
        securityCheck.reason || 'La contraseña no es suficientemente segura.'
      );
      return;
    }

    // Validar que las contraseñas coincidan
    if (!passwordsMatch(password, confirmPassword)) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    // Validar token
    if (!token || !email) {
      toast.error('Token de recuperación inválido o expirado.');
      return;
    }

    setLoading(true);

    try {
      // Llamar al servicio de API para restablecer contraseña
      await authService.resetPassword(email, token, password);

      // Redirigir al login después de un breve delay para que el usuario vea el toast
      setTimeout(() => {
        navigate('/auth/login', {
          replace: true
        });
      }, 1500);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al restablecer la contraseña';
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
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </Button>

      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl">Restablecer Contraseña</CardTitle>
        <CardDescription>
          Ingrese su nueva contraseña para restablecer el acceso
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmitEvent} className="space-y-4">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Nueva Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Cree una contraseña segura"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
                className="pl-10 pr-10"
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-3 hover:bg-transparent"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>

            {/* Indicador de fuerza de contraseña */}
            {password && (
              <PasswordStrengthIndicator
                password={password}
                showRules={true}
                showWarnings={true}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirme su contraseña"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="pl-10 pr-10"
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-3 hover:bg-transparent"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Restableciendo contraseña...
              </>
            ) : (
              'Restablecer contraseña'
            )}
          </Button>

          <div className="text-center mt-4">
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
