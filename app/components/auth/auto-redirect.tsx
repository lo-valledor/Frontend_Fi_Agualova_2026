import { useEffect } from 'react';

import { useNavigate } from 'react-router';
import MoonLoader from 'react-spinners/MoonLoader';

import { useAuth } from '~/context/AuthContext';

interface AutoRedirectProps {
  
  authenticatedRoute?: string;
  
  unauthenticatedRoute?: string;
  
  loadingMessage?: string;
}

export const AutoRedirect = ({
  authenticatedRoute = '/dashboard',
  unauthenticatedRoute = '/auth/login',
  loadingMessage = 'Verificando autenticación...'
}: AutoRedirectProps) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        navigate(authenticatedRoute, { replace: true });
      } else {
        navigate(unauthenticatedRoute, { replace: true });
      }
    }
  }, [
    isAuthenticated,
    loading,
    navigate,
    authenticatedRoute,
    unauthenticatedRoute
  ]);

  if (loading) {
    return (
      <div className='flex h-screen w-screen items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <MoonLoader color='#0ea5e9' />
          <p className='text-sm text-muted-foreground'>{loadingMessage}</p>
        </div>
      </div>
    );
  }

  return null;
};
