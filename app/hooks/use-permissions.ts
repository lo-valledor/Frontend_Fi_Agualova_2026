/**
 * Route Permissions Hook
 *
 * Provides a simplified hook for checking permissions on specific routes.
 * Uses permissions-helpers utilities for route normalization and permission checking.
 *
 * This hook wraps the AuthContext permission functions to provide a convenient
 * interface for checking multiple permission types on a single route.
 */

import { useAuth } from '~/context/AuthContext';
import { buildPermissionQuery } from './utils/permissions-helpers';

/**
 * Permission query result
 */
interface PermissionQuery {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  hasAnyPermission: boolean;
  isLoading: boolean;
}

/**
 * Hook for checking permissions on a specific route
 *
 * Provides a convenient way to check all permission types for a given route
 * at once. Returns an object with boolean flags for each permission type.
 *
 * @param route - The route to check permissions for (e.g., '/dashboard/monitor/monitor-lecturas')
 * @returns {PermissionQuery} Permission query object with boolean flags
 *
 * @example
 * ```tsx
 * const permissions = usePermissions('/dashboard/monitor/monitor-lecturas');
 *
 * // Early return if no view permission
 * if (!permissions.canView) {
 *   return <AccessDenied />;
 * }
 *
 * return (
 *   <div>
 *     {permissions.canCreate && <CreateButton />}
 *     {permissions.canEdit && <EditButton />}
 *     {permissions.canDelete && <DeleteButton />}
 *   </div>
 * );
 * ```
 *
 * @example
 * ```tsx
 * // Check if user has any permission at all
 * const permissions = usePermissions('/dashboard/admin');
 *
 * if (!permissions.hasAnyPermission) {
 *   return <NoAccess />;
 * }
 * ```
 */
export function usePermissions(route: string): PermissionQuery {
  const { canView, canCreate, canEdit, canDelete, permissionsLoading } =
    useAuth();

  // Build permission query using helper
  const permissionQuery = buildPermissionQuery(
    canView(route),
    canCreate(route),
    canEdit(route),
    canDelete(route)
  );

  return {
    canView: permissionQuery.canView,
    canCreate: permissionQuery.canCreate,
    canEdit: permissionQuery.canEdit,
    canDelete: permissionQuery.canDelete,
    hasAnyPermission: permissionQuery.hasAny,
    isLoading: permissionsLoading
  };
}

/**
 * Hook for checking permissions on the current route
 *
 * Similar to usePermissions but automatically uses the current route
 * from window.location.pathname. Useful for components that need to
 * check permissions for the page they're currently on.
 *
 * @returns {PermissionQuery & { currentRoute: string }} Permission query with current route
 *
 * @example
 * ```tsx
 * const { currentRoute, canView, canEdit } = useCurrentRoutePermissions();
 *
 * if (!canView) {
 *   return <Navigate to="/access-denied" />;
 * }
 *
 * return (
 *   <div>
 *     <h1>Current Route: {currentRoute}</h1>
 *     {canEdit && <EditButton />}
 *   </div>
 * );
 * ```
 */
export function useCurrentRoutePermissions(): PermissionQuery & {
  currentRoute: string;
} {
  const { canView, canCreate, canEdit, canDelete, permissionsLoading } =
    useAuth();

  // Get current route from window location
  const currentRoute =
    typeof globalThis === 'undefined' ? '' : globalThis.location.pathname;

  // Build permission query using helper
  const permissionQuery = buildPermissionQuery(
    canView(currentRoute),
    canCreate(currentRoute),
    canEdit(currentRoute),
    canDelete(currentRoute)
  );

  return {
    currentRoute,
    canView: permissionQuery.canView,
    canCreate: permissionQuery.canCreate,
    canEdit: permissionQuery.canEdit,
    canDelete: permissionQuery.canDelete,
    hasAnyPermission: permissionQuery.hasAny,
    isLoading: permissionsLoading
  };
}
