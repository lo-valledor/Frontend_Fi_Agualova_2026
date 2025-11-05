import React from 'react';
import { useLocation } from 'react-router';
import { useAuth } from '~/context/AuthContext';
import { Button, buttonVariants } from '~/components/ui/button';
import type { VariantProps } from 'class-variance-authority';

interface PermissionButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  requiredPermission: 'create' | 'edit' | 'delete';
  children: React.ReactNode;
  hideIfNoPermission?: boolean;
  asChild?: boolean;
}

export function PermissionButton({
  requiredPermission,
  hideIfNoPermission = false,
  children,
  disabled,
  ...props
}: PermissionButtonProps) {
  const location = useLocation();
  const { permissions } = useAuth();

  // Buscar el permiso para la ruta actual
  const currentPermission = permissions.find(p => p.ruta === location.pathname);

  // Verificar si tiene el permiso requerido
  let hasPermission = false;

  if (currentPermission) {
    switch (requiredPermission) {
      case 'create':
        hasPermission = currentPermission.puedeCrear;
        break;
      case 'edit':
        hasPermission = currentPermission.puedeEditar;
        break;
      case 'delete':
        hasPermission = currentPermission.puedeEliminar;
        break;
    }
  }

  // Si no tiene permiso y se debe ocultar, no renderizar
  if (!hasPermission && hideIfNoPermission) {
    return null;
  }

  // Renderizar el botón deshabilitado si no tiene permiso
  return (
    <Button {...props} disabled={disabled || !hasPermission}>
      {children}
    </Button>
  );
}

/**
 * Componente que muestra/oculta contenido basado en permisos
 */
interface PermissionWrapperProps {
  children: React.ReactNode;
  requiredPermission: 'view' | 'create' | 'edit' | 'delete';
  fallback?: React.ReactNode;
}

export function PermissionWrapper({
  children,
  requiredPermission,
  fallback = null
}: PermissionWrapperProps) {
  const location = useLocation();
  const { permissions } = useAuth();

  const currentPermission = permissions.find(p => p.ruta === location.pathname);

  let hasPermission = false;

  if (currentPermission) {
    switch (requiredPermission) {
      case 'view':
        hasPermission = currentPermission.puedeVer;
        break;
      case 'create':
        hasPermission = currentPermission.puedeCrear;
        break;
      case 'edit':
        hasPermission = currentPermission.puedeEditar;
        break;
      case 'delete':
        hasPermission = currentPermission.puedeEliminar;
        break;
    }
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
