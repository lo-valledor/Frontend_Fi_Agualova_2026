/**
 * Utilidades para el manejo de permisos en la aplicación
 * Proporciona funciones helper para verificación y mensajes de permisos
 */

export type PermissionType = 'view' | 'create' | 'edit' | 'delete';

/**
 * Mensajes estándar para cada tipo de permiso
 */
export const PERMISSION_MESSAGES: Record<PermissionType, string> = {
  view: 'No tiene permisos para ver este contenido',
  create: 'No tiene permisos para crear',
  edit: 'No tiene permisos para editar',
  delete: 'No tiene permisos para eliminar'
};

/**
 * Obtiene el mensaje de error apropiado según el tipo de permiso
 * @param permissionType - Tipo de permiso que falta
 * @param customMessage - Mensaje personalizado opcional
 * @returns Mensaje de error formateado
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

export function hasAnyPermission(permissions: {
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

export function hasAllPermissions(
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

export function formatRouteName(route: string): string {
  const segments = route.split('/').filter(Boolean);
  const lastSegment = segments.at(-1);
  
  return (lastSegment || '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

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

