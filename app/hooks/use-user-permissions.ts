/**
 * User Permissions Hook
 *
 * Provides a hook for loading and managing user permissions from the API.
 * Uses permissions-helpers utilities for route normalization and permission finding.
 *
 * This hook fetches permissions for the current authenticated user and provides
 * utility functions to check specific permissions on routes.
 */

import { useEffect, useState } from 'react';

import { rolesPermisosService } from '~/services/rolesPermisosService';
import type { PermisosUsuario } from '~/services/rolesPermisosService';
import { getAuthenticatedUser } from '~/utils/auth-utils';
import { findPermissionForRoute, normalizeRoute } from './utils/permissions-helpers';

/**
 * Return type for useUserPermissions hook
 */
interface UseUserPermissionsReturn {
  permissions: PermisosUsuario[];
  loading: boolean;
  error: string | null;
  hasPermission: (ruta: string) => boolean;
  canView: (ruta: string) => boolean;
  canCreate: (ruta: string) => boolean;
  canEdit: (ruta: string) => boolean;
  canDelete: (ruta: string) => boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook for loading and managing user permissions
 *
 * Fetches permissions for the authenticated user and provides utility functions
 * to check permissions on specific routes. Automatically loads permissions on mount.
 *
 * Permissions are fetched from the API based on the authenticated user's ID.
 * If no user is authenticated, returns empty permissions array.
 *
 * @returns {UseUserPermissionsReturn} Hook state and permission check functions
 *
 * @example
 * ```tsx
 * const {
 *   permissions,
 *   loading,
 *   error,
 *   canView,
 *   canEdit
 * } = useUserPermissions();
 *
 * if (loading) return <Loading />;
 * if (error) return <Error message={error} />;
 *
 * if (canView('/dashboard/admin')) {
 *   // User can view admin dashboard
 * }
 *
 * if (canEdit('/dashboard/admin')) {
 *   // User can edit admin content
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Refetch permissions after user role change
 * const { refetch } = useUserPermissions();
 *
 * const handleRoleUpdate = async () => {
 *   await updateUserRole();
 *   await refetch(); // Reload permissions
 * };
 * ```
 */
export function useUserPermissions(): UseUserPermissionsReturn {
  const [permissions, setPermissions] = useState<PermisosUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Early return if user not authenticated
      const user = getAuthenticatedUser();
      if (!user?.id) {
        setPermissions([]);
        setError('Usuario no autenticado');
        return;
      }

      const response = await rolesPermisosService.getPermisosUsuario(user.id);

      if (response.error) {
        setError(response.error);
        setPermissions([]);
      } else {
        setPermissions(response.data || []);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar permisos';
      setError(errorMessage);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  /**
   * Finds permission for a specific route
   *
   * Uses permission helper to normalize route and find matching permission.
   *
   * @param ruta - Route to find permission for
   * @returns Permission object or undefined
   */
  const findPermission = (ruta: string): PermisosUsuario | undefined => {
    // Early return for empty route
    if (!ruta) {
      return undefined;
    }

    const normalizedRuta = normalizeRoute(ruta);
    return findPermissionForRoute(normalizedRuta, permissions, 'ruta');
  };

  /**
   * Checks if user has any permission (view) for a route
   *
   * @param ruta - Route to check
   * @returns True if user can view the route
   */
  const hasPermission = (ruta: string): boolean => {
    const permission = findPermission(ruta);
    return permission?.puedeVer ?? false;
  };

  /**
   * Checks if user can view a route
   *
   * @param ruta - Route to check
   * @returns True if user has view permission
   */
  const canView = (ruta: string): boolean => {
    const permission = findPermission(ruta);
    return permission?.puedeVer ?? false;
  };

  /**
   * Checks if user can create on a route
   *
   * @param ruta - Route to check
   * @returns True if user has create permission
   */
  const canCreate = (ruta: string): boolean => {
    const permission = findPermission(ruta);
    return permission?.puedeCrear ?? false;
  };

  /**
   * Checks if user can edit on a route
   *
   * @param ruta - Route to check
   * @returns True if user has edit permission
   */
  const canEdit = (ruta: string): boolean => {
    const permission = findPermission(ruta);
    return permission?.puedeEditar ?? false;
  };

  /**
   * Checks if user can delete on a route
   *
   * @param ruta - Route to check
   * @returns True if user has delete permission
   */
  const canDelete = (ruta: string): boolean => {
    const permission = findPermission(ruta);
    return permission?.puedeEliminar ?? false;
  };

  return {
    permissions,
    loading,
    error,
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    refetch: fetchPermissions
  };
}
