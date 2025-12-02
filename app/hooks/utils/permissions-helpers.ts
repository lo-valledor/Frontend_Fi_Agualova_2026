/**
 * Permissions Helper Utilities (Wrapper Layer)
 *
 * Thin wrapper around core permission utilities from ~/utils/permission-utils.
 * Provides hook-specific convenience functions and backward-compatible aliases.
 *
 * @see ~/utils/permission-utils.ts - Core permission logic implementation
 */

// Re-export core permission utilities
export {
  // Core permission checking (array variants with hook-friendly names)
  hasAllPermissionsArray as hasAllPermissions,
  hasAnyPermissionArray as hasAnyPermission,
  isPermissionGranted,

  // Route handling
  normalizeRoute,
  findPermissionForRoute,

  // Query building and validation
  buildPermissionQuery,
  isPermissionStateReady,

  // Additional utilities available for hooks
  hasAnyPermissionObject,
  hasAllPermissionsObject,
  formatRouteName,
  getPermissionsSummary,
  checkMultipleRoutes,

  // Type exports
  type PermissionType
} from '~/utils/permission-utils';
