/**
 * Permission Management Utilities
 *
 * Provides helper functions for permission checking, validation, and messaging.
 * Includes both core permission logic and hook-specific utilities.
 */

export type PermissionType = 'view' | 'create' | 'edit' | 'delete';

/**
 * Standard permission messages
 */
export const PERMISSION_MESSAGES: Record<PermissionType, string> = {
  view: 'No tiene permisos para ver este contenido',
  create: 'No tiene permisos para crear',
  edit: 'No tiene permisos para editar',
  delete: 'No tiene permisos para eliminar'
};

/**
 * Gets appropriate error message based on permission type
 *
 * @param permissionType - Type of missing permission
 * @param customMessage - Optional custom message
 * @returns Formatted error message
 *
 * @example
 * ```ts
 * const message = getPermissionMessage('create', 'No puede crear usuarios');
 * // Returns: "No puede crear usuarios"
 * ```
 */
export function getPermissionMessage(
  permissionType: PermissionType,
  customMessage?: string
): string {
  return customMessage || PERMISSION_MESSAGES[permissionType];
}

/**
 * Checks if user has any CRUD permission (object version)
 *
 * @param permissions - Object with boolean permission flags
 * @param permissions.canView
 * @param permissions.canCreate
 * @param permissions.canEdit
 * @param permissions.canDelete
 * @returns True if at least one permission is granted
 *
 * @example
 * ```ts
 * const hasSome = hasAnyPermissionObject({
 *   canView: true,
 *   canCreate: false,
 *   canEdit: false,
 *   canDelete: false
 * }); // Returns: true
 * ```
 */
export function hasAnyPermissionObject(permissions: {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}): boolean {
  return (
    permissions.canView ||
    permissions.canCreate ||
    permissions.canEdit ||
    permissions.canDelete
  );
}

/**
 * Checks if user has all required CRUD permissions (object version)
 *
 * @param permissions - Object with boolean permission flags
 * @param permissions.canView
 * @param permissions.canCreate
 * @param permissions.canEdit
 * @param permissions.canDelete
 * @param required - Required permission keys
 * @returns True if all required permissions are granted
 *
 * @example
 * ```ts
 * const hasRequired = hasAllPermissionsObject(
 *   { canView: true, canCreate: true, canEdit: false, canDelete: false },
 *   ['canView', 'canCreate']
 * ); // Returns: true
 * ```
 */
export function hasAllPermissionsObject(
  permissions: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  },
  required: Array<keyof typeof permissions>
): boolean {
  return required.every(permission => permissions[permission]);
}

/**
 * Checks if value is truthy permission (array version)
 *
 * @param value - Permission value
 * @returns True if permission is granted
 */
export function isPermissionGranted(value: any): boolean {
  return !!value;
}

/**
 * Checks multiple permissions with AND logic (array version)
 *
 * @param permissions - Array of permission values
 * @returns True if all permissions are granted
 */
export function hasAllPermissionsArray(permissions: any[]): boolean {
  return Array.isArray(permissions) && permissions.every(p => isPermissionGranted(p));
}

/**
 * Checks multiple permissions with OR logic (array version)
 *
 * @param permissions - Array of permission values
 * @returns True if any permission is granted
 */
export function hasAnyPermissionArray(permissions: any[]): boolean {
  return Array.isArray(permissions) && permissions.some(p => isPermissionGranted(p));
}

/**
 * Normalizes a route path for consistent comparison
 *
 * @param ruta - Route path to normalize
 * @returns Normalized route with leading slash
 *
 * @example
 * ```typescript
 * normalizeRoute('dashboard/admin')   // '/dashboard/admin'
 * normalizeRoute('/dashboard/admin')  // '/dashboard/admin'
 * ```
 */
export function normalizeRoute(ruta: string): string {
  if (!ruta) return '';
  return ruta.startsWith('/') ? ruta : `/${ruta}`;
}

/**
 * Safely extracts permission from route
 *
 * @param ruta - Route path
 * @param permissions - Permission records to search
 * @param permissionKey - Key to check (default: 'ruta')
 * @returns Found permission or undefined
 *
 * @example
 * ```typescript
 * const perm = findPermissionForRoute('/admin', permissions, 'ruta');
 * ```
 */
export function findPermissionForRoute<T extends Record<string, any>>(
  ruta: string,
  permissions: T[],
  permissionKey: string = 'ruta'
): T | undefined {
  if (!ruta || !Array.isArray(permissions)) {
    return undefined;
  }

  const normalizedRuta = normalizeRoute(ruta);
  return permissions.find(p => p[permissionKey] === normalizedRuta);
}

/**
 * Builds permission query object
 *
 * @param canView - View permission
 * @param canCreate - Create permission
 * @param canEdit - Edit permission
 * @param canDelete - Delete permission
 * @returns Permission query object with aggregate checks
 *
 * @example
 * ```typescript
 * const query = buildPermissionQuery(true, false, false, false);
 * // Returns: { canView: true, canCreate: false, canEdit: false, canDelete: false, hasAny: true, hasAll: false }
 * ```
 */
export function buildPermissionQuery(
  canView: boolean,
  canCreate: boolean,
  canEdit: boolean,
  canDelete: boolean
) {
  return {
    canView,
    canCreate,
    canEdit,
    canDelete,
    hasAny: canView || canCreate || canEdit || canDelete,
    hasAll: canView && canCreate && canEdit && canDelete
  };
}

/**
 * Validates that permission state is ready (loaded)
 *
 * @param isLoading - Loading state
 * @param permissions - Permissions array
 * @returns True if permissions are fully loaded
 */
export function isPermissionStateReady(isLoading: boolean, permissions: any[]): boolean {
  return !isLoading && Array.isArray(permissions);
}

/**
 * Formats route name for display (title case)
 *
 * @param route - Route path
 * @returns Formatted route name
 *
 * @example
 * ```ts
 * formatRouteName('/admin/user-management')  // "User Management"
 * ```
 */
export function formatRouteName(route: string): string {
  const segments = route.split('/').filter(Boolean);
  const lastSegment = segments.at(-1);

  return (lastSegment || '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Gets summary of granted permissions
 *
 * @param permissions - Object with boolean permission flags
 * @param permissions.canView
 * @param permissions.canCreate
 * @param permissions.canEdit
 * @param permissions.canDelete
 * @returns Array of Spanish permission names
 *
 * @example
 * ```ts
 * getPermissionsSummary({ canView: true, canCreate: true, canEdit: false, canDelete: false })
 * // Returns: ['Ver', 'Crear']
 * ```
 */
export function getPermissionsSummary(permissions: {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}): string[] {
  const summary: string[] = [];

  if (permissions.canView) summary.push('Ver');
  if (permissions.canCreate) summary.push('Crear');
  if (permissions.canEdit) summary.push('Editar');
  if (permissions.canDelete) summary.push('Eliminar');

  return summary;
}

/**
 * Checks permission access for multiple routes
 *
 * @param checkPermission - Function to check permission for a route
 * @param routes - Array of routes to check
 * @returns Object with accessible and inaccessible routes
 *
 * @example
 * ```ts
 * const result = checkMultipleRoutes(
 *   (route) => userPermissions.includes(route),
 *   ['/admin', '/dashboard', '/users']
 * );
 * ```
 */
export function checkMultipleRoutes(
  checkPermission: (route: string) => boolean,
  routes: string[]
): { accessible: string[]; inaccessible: string[] } {
  const accessible: string[] = [];
  const inaccessible: string[] = [];

  for (const route of routes) {
    if (checkPermission(route)) {
      accessible.push(route);
    } else {
      inaccessible.push(route);
    }
  }

  return { accessible, inaccessible };
}

