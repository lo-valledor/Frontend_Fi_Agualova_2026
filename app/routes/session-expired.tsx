import React, { useEffect } from 'react';

import { useNavigate } from 'react-router';

import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { clearAuthToken } from '~/services/axiosConfig';

interface SessionExpiredProps {
  message?: string;
}

const SessionExpired: React.FC<SessionExpiredProps> = ({
  message = 'Tu sesión ha expirado o ha sido cerrada en otro dispositivo.'
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.removeItem('token');
    clearAuthToken();

    // Redirigir automáticamente al login después de un breve delay
    const timer = setTimeout(() => {
      navigate('/auth/login', { replace: true });
    }, 2000); // 2 segundos para mostrar el mensaje

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleLogin = () => {
    navigate('/auth/login', { replace: true });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-[350px]">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-red-600">
            Sesión finalizada
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Serás redirigido al login automáticamente...
          </div>

          <Button onClick={handleLogin} className="w-full">
            Ir al login ahora
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionExpired;
