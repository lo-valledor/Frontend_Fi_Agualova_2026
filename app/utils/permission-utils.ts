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

/**
 * Verifica si el usuario tiene al menos uno de los permisos especificados
 * @param permissions - Objeto con los permisos del usuario
 * @returns true si tiene al menos un permiso
 * 
 * @example
 * ```ts
 * const permissions = { canView: false, canCreate: true, canEdit: false, canDelete: false };
 * const hasAny = hasAnyPermission(permissions);
 * // Returns: true
 * ```
 */
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

/**
 * Verifica si el usuario tiene todos los permisos especificados
 * @param permissions - Objeto con los permisos del usuario
 * @param required - Array con los permisos requeridos
 * @returns true si tiene todos los permisos requeridos
 * 
 * @example
 * ```ts
 * const permissions = { canView: true, canCreate: true, canEdit: false, canDelete: false };
 * const hasAll = hasAllPermissions(permissions, ['canView', 'canCreate']);
 * // Returns: true
 * ```
 */
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

/**
 * Formatea el nombre de una ruta para mostrar en mensajes
 * @param route - Ruta a formatear
 * @returns Nombre formateado de la ruta
 * 
 * @example
 * ```ts
 * formatRouteName('/dashboard/monitor/monitor-lecturas');
 * // Returns: "Monitor Lecturas"
 * ```
 */
export function formatRouteName(route: string): string {
  const segments = route.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  return lastSegment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Obtiene un resumen de los permisos del usuario
 * @param permissions - Objeto con los permisos
 * @returns Array con los nombres de los permisos activos
 * 
 * @example
 * ```ts
 * const permissions = { canView: true, canCreate: true, canEdit: false, canDelete: false };
 * getPermissionsSummary(permissions);
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
 * Verifica si una lista de rutas está completamente accesible
 * @param checkPermission - Función para verificar permisos
 * @param routes - Array de rutas a verificar
 * @returns Objeto con las rutas accesibles e inaccesibles
 * 
 * @example
 * ```ts
 * const result = checkMultipleRoutes(
 *   canView,
 *   ['/dashboard/monitor/monitor-lecturas', '/dashboard/operaciones/revisar-precio']
 * );
 * // Returns: { accessible: [...], inaccessible: [...] }
 * ```
 */
export function checkMultipleRoutes(
  checkPermission: (route: string) => boolean,
  routes: string[]
): { accessible: string[]; inaccessible: string[] } {
  const accessible: string[] = [];
  const inaccessible: string[] = [];
  
  routes.forEach(route => {
    if (checkPermission(route)) {
      accessible.push(route);
    } else {
      inaccessible.push(route);
    }
  });
  
  return { accessible, inaccessible };
}

