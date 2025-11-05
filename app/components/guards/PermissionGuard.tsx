import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '~/context/AuthContext';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: 'view' | 'create' | 'edit' | 'delete';
  fallbackPath?: string;
}

export function PermissionGuard({
  children,
  requiredPermission = 'view',
  fallbackPath = '/dashboard'
}: PermissionGuardProps) {
  const location = useLocation();
  const { permissions, permissionsLoading } = useAuth();

  // Mientras carga, no renderizar nada o mostrar un loader
  if (permissionsLoading) {
    return (
      <div className='flex h-screen w-screen items-center justify-center'>
        <div className='text-muted-foreground'>Verificando permisos...</div>
      </div>
    );
  }

  // Buscar el permiso para la ruta actual
  const currentPermission = permissions.find(p => p.ruta === location.pathname);

  // Verificar si tiene el permiso requerido
  let hasRequiredPermission = false;

  if (currentPermission) {
    switch (requiredPermission) {
      case 'view':
        hasRequiredPermission = currentPermission.puedeVer;
        break;
      case 'create':
        hasRequiredPermission = currentPermission.puedeCrear;
        break;
      case 'edit':
        hasRequiredPermission = currentPermission.puedeEditar;
        break;
      case 'delete':
        hasRequiredPermission = currentPermission.puedeEliminar;
        break;
      default:
        hasRequiredPermission = false;
    }
  }

  // Si no tiene permisos, redirigir
  if (!hasRequiredPermission) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Si tiene permisos, renderizar el contenido
  return <>{children}</>;
}

export function usePermissionCheck() {
  const location = useLocation();
  const { permissions, canView, canCreate, canEdit, canDelete } = useAuth();

  const currentPermission = permissions.find(p => p.ruta === location.pathname);

  return {
    permission: currentPermission,
    canView: canView(location.pathname),
    canCreate: canCreate(location.pathname),
    canEdit: canEdit(location.pathname),
    canDelete: canDelete(location.pathname)
  };
}
