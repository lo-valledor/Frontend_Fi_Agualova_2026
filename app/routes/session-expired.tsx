// src/components/SessionExpired.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '~/context/AuthContext';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';

interface SessionExpiredProps {
  message?: string;
}

export const SessionExpired: React.FC<SessionExpiredProps> = ({
  message = 'Tu sesión ha expirado o ha sido cerrada en otro dispositivo.',
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    // Limpiar la sesión cuando se muestra este componente
    //console.log('SessionExpired component mounted');
    logout();
  }, [logout]);

  const handleLogin = () => {
    navigate('/auth/login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Sesión finalizada</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogin} className="w-full">
            Volver a iniciar sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
