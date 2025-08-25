import { AlertTriangle, Home, LogOut, RefreshCw } from 'lucide-react';

import React from 'react';

import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';

interface ErrorBoundaryProps {
  error?: Error;
  resetError?: () => void;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  error,
  resetError
}) => {
  const handleRetry = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  const handleLogout = () => {
    // Limpiar token y datos de autenticación
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();

    // Redireccionar al login
    window.location.href = '/auth/login';
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='flex items-center justify-center min-h-[60vh]'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-full w-fit'>
              <AlertTriangle className='h-8 w-8 text-red-600 dark:text-red-400' />
            </div>
            <CardTitle className='text-xl text-red-800 dark:text-red-200'>
              Error de Carga
            </CardTitle>
            <CardDescription className='text-red-600 dark:text-red-400'>
              Ocurrió un problema al cargar esta página
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {error && (
              <Alert variant='destructive'>
                <AlertTriangle className='h-4 w-4' />
                <AlertDescription>
                  <strong>Error:</strong> {error.message}
                </AlertDescription>
              </Alert>
            )}

            <div className='space-y-2'>
              <p className='text-sm text-muted-foreground text-center'>
                Esto puede deberse a:
              </p>
              <ul className='text-sm text-muted-foreground space-y-1'>
                <li>• Problemas de conexión a internet</li>
                <li>• Errores en el servidor</li>
                <li>• Problemas con los módulos JavaScript</li>
                <li>• Caché del navegador desactualizado</li>
              </ul>
            </div>

            <div className='flex flex-col gap-2'>
              <Button onClick={handleRetry} className='w-full'>
                <RefreshCw className='h-4 w-4 mr-2' />
                Reintentar
              </Button>
              <Button
                onClick={handleGoHome}
                variant='outline'
                className='w-full'
              >
                <Home className='h-4 w-4 mr-2' />
                Ir al Inicio
              </Button>
              <Button
                onClick={handleLogout}
                variant='outline'
                className='w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300'
              >
                <LogOut className='h-4 w-4 mr-2' />
                Cerrar Sesión
              </Button>
            </div>

            <div className='text-center'>
              <p className='text-xs text-muted-foreground'>
                Si el problema persiste, contacta al administrador del sistema
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
