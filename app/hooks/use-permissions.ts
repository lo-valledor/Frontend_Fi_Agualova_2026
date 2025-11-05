import { useAuth } from '~/context/AuthContext';

/**
 * Hook simplificado para verificar permisos en una ruta específica
 * @param route - La ruta a verificar (ej: '/dashboard/monitor/monitor-lecturas')
 * @returns Objeto con los permisos disponibles para la ruta
 *
 * @example
 * ```tsx
 * const { canView, canCreate, canEdit } = usePermissions('/dashboard/monitor/monitor-lecturas');
 *
 * if (!canView) {
 *   return <AccessDenied />;
 * }
 * ```
 */
export function usePermissions(route: string) {
  const { canView, canCreate, canEdit, canDelete, permissionsLoading } =
    useAuth();

  return {
    canView: canView(route),
    canCreate: canCreate(route),
    canEdit: canEdit(route),
    canDelete: canDelete(route),
    hasAnyPermission:
      canView(route) || canCreate(route) || canEdit(route) || canDelete(route),
    isLoading: permissionsLoading
  };
}

export function useCurrentRoutePermissions() {
  const { canView, canCreate, canEdit, canDelete, permissionsLoading } =
    useAuth();

  // En React Router v7, podemos usar globalThis.location.pathname
  const currentRoute =
    typeof window !== 'undefined' ? globalThis.location.pathname : '';

  return {
    currentRoute,
    canView: canView(currentRoute),
    canCreate: canCreate(currentRoute),
    canEdit: canEdit(currentRoute),
    canDelete: canDelete(currentRoute),
    hasAnyPermission:
      canView(currentRoute) ||
      canCreate(currentRoute) ||
      canEdit(currentRoute) ||
      canDelete(currentRoute),
    isLoading: permissionsLoading
  };
}
