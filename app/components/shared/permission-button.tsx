import React from 'react';

import { useAuth } from '~/context/AuthContext';

import { Button } from '~/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip';

type PermissionType = 'create' | 'edit' | 'delete' | 'view';

interface PermissionButtonProps extends React.ComponentProps<typeof Button> {
  /**
   * La ruta para la cual verificar permisos
   */
  route: string;
  /**
   * El tipo de permiso requerido
   */
  requiredPermission: PermissionType;
  /**
   * Si es true, oculta el botón cuando no tiene permisos
   * Si es false, muestra el botón deshabilitado con tooltip
   * @default false
   */
  hideWhenDisabled?: boolean;
  /**
   * Mensaje personalizado cuando no tiene permisos
   */
  noPermissionMessage?: string;
}

const permissionMessages: Record<PermissionType, string> = {
  create: 'No tiene permisos para crear',
  edit: 'No tiene permisos para editar',
  delete: 'No tiene permisos para eliminar',
  view: 'No tiene permisos para ver'
};

/**
 * Botón que verifica permisos antes de habilitarse o mostrarse
 *
 * @example
 * ```tsx
 * // Botón que se deshabilita si no tiene permiso de crear
 * <PermissionButton
 *   route="/dashboard/monitor/monitor-lecturas"
 *   requiredPermission="create"
 *   onClick={handleCreate}
 * >
 *   Crear Nuevo
 * </PermissionButton>
 *
 * // Botón que se oculta si no tiene permiso de editar
 * <PermissionButton
 *   route="/dashboard/administracion/usuarios"
 *   requiredPermission="edit"
 *   hideWhenDisabled
 *   onClick={handleEdit}
 * >
 *   Editar Usuario
 * </PermissionButton>
 * ```
 */
export const PermissionButton = React.forwardRef<
  HTMLButtonElement,
  PermissionButtonProps
>(
  (
    {
      route,
      requiredPermission,
      hideWhenDisabled = false,
      noPermissionMessage,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const { canView, canCreate, canEdit, canDelete } = useAuth();

    // Verificar el permiso según el tipo requerido
    const hasPermission = React.useMemo(() => {
      switch (requiredPermission) {
        case 'view':
          return canView(route);
        case 'create':
          return canCreate(route);
        case 'edit':
          return canEdit(route);
        case 'delete':
          return canDelete(route);
        default:
          return false;
      }
    }, [route, requiredPermission, canView, canCreate, canEdit, canDelete]);

    // Si no tiene permiso y debe ocultarse, no renderizar nada
    if (!hasPermission && hideWhenDisabled) {
      return null;
    }

    const isDisabled = disabled || !hasPermission;
    const tooltipMessage =
      noPermissionMessage || permissionMessages[requiredPermission];

    // Si tiene permisos o está deshabilitado por otras razones, renderizar sin tooltip
    if (hasPermission || disabled) {
      return (
        <Button ref={ref} disabled={isDisabled} {...props}>
          {children}
        </Button>
      );
    }

    // Si no tiene permisos y no debe ocultarse, mostrar con tooltip
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>
              <Button ref={ref} disabled={isDisabled} {...props}>
                {children}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

PermissionButton.displayName = 'PermissionButton';
