import type { PermisoRolMenu } from '~/types/roles-permisos';

import { PermisoCheckbox } from './permiso-checkbox';

interface PermisoCheckboxGroupProps {
  permiso: PermisoRolMenu | undefined;
  rolId: number;
  menuId: number;
  onTogglePermiso: (
    idRol: number,
    idMenu: number,
    tipoPermiso: string,
    valor: boolean
  ) => void;
  layout?: 'mobile' | 'table';
}

export function PermisoCheckboxGroup({
  permiso,
  rolId,
  menuId,
  onTogglePermiso,
  layout = 'table'
}: PermisoCheckboxGroupProps) {
  const handleToggle = (tipoPermiso: string, currentValue: boolean) => {
    onTogglePermiso(rolId, menuId, tipoPermiso, !currentValue);
  };

  if (layout === 'mobile') {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <div
            onClick={() => handleToggle('puedeVer', permiso?.puedeVer ?? false)}
            className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20 p-2 rounded-lg transition-colors"
          >
            <PermisoCheckbox
              checked={permiso?.puedeVer ?? false}
              onCheckedChange={() => {}}
              className="h-4 w-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 pointer-events-none"
            />
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              Ver
            </span>
          </div>
          <div
            onClick={() =>
              handleToggle('puedeCrear', permiso?.puedeCrear ?? false)
            }
            className="flex items-center gap-2 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/20 p-2 rounded-lg transition-colors"
          >
            <PermisoCheckbox
              checked={permiso?.puedeCrear ?? false}
              onCheckedChange={() => {}}
              className="h-4 w-4 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 pointer-events-none"
            />
            <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              Crear
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <div
            onClick={() =>
              handleToggle('puedeEditar', permiso?.puedeEditar ?? false)
            }
            className="flex items-center gap-2 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/20 p-2 rounded-lg transition-colors"
          >
            <PermisoCheckbox
              checked={permiso?.puedeEditar ?? false}
              onCheckedChange={() => {}}
              className="h-4 w-4 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600 pointer-events-none"
            />
            <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
              Editar
            </span>
          </div>
          <div
            onClick={() =>
              handleToggle('puedeEliminar', permiso?.puedeEliminar ?? false)
            }
            className="flex items-center gap-2 cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/20 p-2 rounded-lg transition-colors"
          >
            <PermisoCheckbox
              checked={permiso?.puedeEliminar ?? false}
              onCheckedChange={() => {}}
              className="h-4 w-4 data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600 pointer-events-none"
            />
            <span className="text-sm text-rose-600 dark:text-rose-400 font-medium">
              Eliminar
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-1">
      <div
        onClick={() => handleToggle('puedeVer', permiso?.puedeVer ?? false)}
        className={`flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all ${
          permiso?.puedeVer
            ? 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50'
            : 'hover:bg-blue-50 dark:hover:bg-blue-950/20'
        }`}
        title="Ver"
      >
        <PermisoCheckbox
          checked={permiso?.puedeVer ?? false}
          onCheckedChange={() => {}}
          className="h-5 w-5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 pointer-events-none"
        />
      </div>
      <div
        onClick={() => handleToggle('puedeCrear', permiso?.puedeCrear ?? false)}
        className={`flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all ${
          permiso?.puedeCrear
            ? 'bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
            : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
        }`}
        title="Crear"
      >
        <PermisoCheckbox
          checked={permiso?.puedeCrear ?? false}
          onCheckedChange={() => {}}
          className="h-5 w-5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 pointer-events-none"
        />
      </div>
      <div
        onClick={() =>
          handleToggle('puedeEditar', permiso?.puedeEditar ?? false)
        }
        className={`flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all ${
          permiso?.puedeEditar
            ? 'bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50'
            : 'hover:bg-amber-50 dark:hover:bg-amber-950/20'
        }`}
        title="Editar"
      >
        <PermisoCheckbox
          checked={permiso?.puedeEditar ?? false}
          onCheckedChange={() => {}}
          className="h-5 w-5 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600 pointer-events-none"
        />
      </div>
      <div
        onClick={() =>
          handleToggle('puedeEliminar', permiso?.puedeEliminar ?? false)
        }
        className={`flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all ${
          permiso?.puedeEliminar
            ? 'bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 dark:hover:bg-rose-900/50'
            : 'hover:bg-rose-50 dark:hover:bg-rose-950/20'
        }`}
        title="Eliminar"
      >
        <PermisoCheckbox
          checked={permiso?.puedeEliminar ?? false}
          onCheckedChange={() => {}}
          className="h-5 w-5 data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600 pointer-events-none"
        />
      </div>
    </div>
  );
}
PermisoCheckboxGroup.displayName = 'PermisoCheckboxGroup';
