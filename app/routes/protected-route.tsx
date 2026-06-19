import { Navigate, Outlet, useLocation } from 'react-router';
import MoonLoader from 'react-spinners/MoonLoader';

import { useAuth } from '~/context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <MoonLoader />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirigir al login, guardando la ubicación actual para volver después
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
